import { Controller, Get, Inject, Logger, Param, Query } from '@nestjs/common'
import { TypeId } from '../../common/domains/industry/entities/type.entity'
import { LoadTypePort } from '../../common/domains/industry/ports/out/load-type.port'
import { LoadBlueprintPort } from '../../common/domains/industry/ports/out/load-blueprint.port'
import { CalculateManufacturingCostService } from '../../common/domains/industry/services/calculate-manufacturing-cost.service'
import { LOAD_BLUEPRINTS_PORT, LOAD_TYPES_PORT } from './industry.module.constants'

@Controller('industry')
export class IndustryController {
	@Inject(LOAD_TYPES_PORT) private _loadTypePort: LoadTypePort
	@Inject(LOAD_BLUEPRINTS_PORT) private _loadBlueprintPort: LoadBlueprintPort
	constructor() {}
	@Get('ManufacturingCost/:id')
	async manufacturingCost(@Param('id') id: number, @Query('quantity') quantity: number = 1) {
		id = Number(id)
		quantity = Number(quantity)
		const service = new CalculateManufacturingCostService(this._loadTypePort, this._loadBlueprintPort)

		const response = await service.calculateManufacturingCost(id, quantity)

		return await Promise.all(
			response.map(async (it) => ({ ...it, name: (await this._loadTypePort.loadType(it.typeId)).name }))
		)
	}

	@Get('ManufacturingGraph/:id')
	async manufacturingGraph(@Param('id') id: string) {
		return await new CalculateManufacturingCostService(
			this._loadTypePort,
			this._loadBlueprintPort
		).generateManufacturingGraph(Number(id))
	}
}
