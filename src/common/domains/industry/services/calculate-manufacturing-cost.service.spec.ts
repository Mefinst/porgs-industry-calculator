import { CalculateManufacturingCostService } from './calculate-manufacturing-cost.service'
import { LoadTypePort } from '../ports/out/load-type.port'
import { TypeEntity, TypeId } from '../entities/type.entity'
import { LoadBlueprintPort } from '../ports/out/load-blueprint.port'
import { BlueprintEntity } from '../entities/blueprint.entity'
import * as assert from 'assert'
import { IndustryActivityEntity } from '../entities/industry-activity.entity'

describe('Calculate Manufacturing Cost Service', () => {
	it('should return the same type and amount, when no blueprint provided', async () => {
		const loadTypePort: LoadTypePort = {
			loadType(id: TypeId): Promise<TypeEntity> {
				return Promise.resolve(new TypeEntity(id, '', ''))
			}
		}
		const loadBlueprintPort: LoadBlueprintPort = {
			loadBlueprint(productId: TypeId): Promise<BlueprintEntity> {
				return Promise.resolve(null)
			}
		}

		const service = new CalculateManufacturingCostService(loadTypePort, loadBlueprintPort)

		const id = 1000
		const quantity = 5
		const cost = await service.calculateManufacturingCost(id, quantity)

		assert.strictEqual(cost.length, 1)
		assert.strictEqual(cost[0].typeId, id)
		assert.strictEqual(cost[0].quantity, quantity)
	})

	it('should build a thing from blueprint', async () => {
		const testProductId = 1000
		const materialsList = []
		for (let i = 1; i < 11; i++) {
			materialsList.push({ typeId: i, quantity: 100 * i })
		}
		const loadTypePort: LoadTypePort = {
			loadType(id: TypeId): Promise<TypeEntity> {
				return Promise.resolve(new TypeEntity(id, '', ''))
			}
		}
		const loadBlueprintPort: LoadBlueprintPort = {
			loadBlueprint(productId: TypeId): Promise<BlueprintEntity> {
				if (productId === testProductId)
					return Promise.resolve(
						new BlueprintEntity(
							100,
							new Map<string, IndustryActivityEntity>([
								[
									'manufacturing',
									new IndustryActivityEntity(
										[
											{
												typeId: testProductId,
												quantity: 1
											}
										],
										materialsList,
										900
									)
								]
							])
						)
					)
				return Promise.resolve(null)
			}
		}

		const service = new CalculateManufacturingCostService(loadTypePort, loadBlueprintPort)

		const result = await service.calculateManufacturingCost(testProductId, 1)

		result
			.reduce((pairs, value) => {
				pairs.push([value, materialsList.find((it) => it.typeId === value.typeId)])
				return pairs
			}, [])
			.forEach((pair) => {
				assert.deepStrictEqual(pair[0], pair[1])
				assert.notStrictEqual(pair[0].typeId, undefined)
			})
	})

	it('should recursively go through blueprints', async () => {
		const loadTypePort: LoadTypePort = {
			loadType(id: TypeId): Promise<TypeEntity> {
				return Promise.resolve(new TypeEntity(id, '', ''))
			}
		}
		const loadBlueprintPort: LoadBlueprintPort = {
			loadBlueprint(productId: TypeId): Promise<BlueprintEntity> {
				if (productId === 1) return Promise.resolve(null)

				return Promise.resolve(
					new BlueprintEntity(
						(productId as number) + 100,
						new Map<string, IndustryActivityEntity>([
							[
								'manufacturing',
								new IndustryActivityEntity(
									[
										{
											typeId: productId,
											quantity: 1
										}
									],
									[
										{
											typeId: (productId as number) - 1,
											quantity: 2
										}
									],
									900
								)
							]
						])
					)
				)
			}
		}

		const service = new CalculateManufacturingCostService(loadTypePort, loadBlueprintPort)

		const result = await service.calculateManufacturingCost(4, 3)

		assert.strictEqual(result[0].typeId, 1)
		assert.strictEqual(result[0].quantity, 3 * 2 * 2 * 2)
	})
})
