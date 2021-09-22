import { LoadBlueprintPort } from '../ports/out/load-blueprint.port'
import { LoadTypePort } from '../ports/out/load-type.port'
import { TypeId } from '../entities/type.entity'
import { CalculateManufacturingCostQuery } from '../ports/in/calculate-manufacturing-cost.query'
import { ItemsButch } from '../entities/industry-activity.entity'

type GraphLink = {
	target: TypeId
	source: TypeId
	quantity: number
}
type GraphNode = {
	typeId: TypeId
	itemsPerRun: number
	updated: boolean
}
type FlatGraph = {
	nodes: GraphNode[]
	links: GraphLink[]
	origin: GraphNode
}

export class CalculateManufacturingCostService implements CalculateManufacturingCostQuery {
	constructor(private _loadTypePort: LoadTypePort, private _loadBlueprintPort: LoadBlueprintPort) {}

	async calculateManufacturingCost(typeId: TypeId, quantity: number): Promise<ItemsButch[]> {
		const { nodes, links } = await this.generateManufacturingGraph(typeId)

		if (nodes.length === 1) return [{ typeId, quantity }]

		return Array.from(
			nodes
				.filter((node) => !links.filter((link) => link.target === node.typeId).length)
				.map((node) => ({
					typeId: node.typeId,
					quantity: links
						.filter((link) => link.source === node.typeId)
						.reduce((sum, { quantity }) => sum + quantity, 0)
				}))
				.map((it) => ({ ...it, quantity: it.quantity * quantity }))
				.reduce((map, it) => {
					if (map.has(it.typeId)) return map

					map.set(it.typeId, it)
					return map
				}, new Map())
				.values()
		)
	}

	public async generateManufacturingGraph(typeId: TypeId): Promise<FlatGraph> {
		const originTypeId = typeId
		const nodes: GraphNode[] = []
		const links: GraphLink[] = []

		const processNode = async (typeId: TypeId) => {
			if (nodes.find((node) => node.typeId === typeId)) return

			const blueprint = await this._loadBlueprintPort.loadBlueprint(typeId)
			if (blueprint == null) {
				nodes.push({ typeId: typeId, itemsPerRun: 1, updated: false })
				return
			}

			const activity = Array.from(blueprint.activities.values()).find((it) =>
				it.products.find((product) => product.typeId === typeId)
			)

			if (activity == null) {
				nodes.push({ typeId: typeId, itemsPerRun: 1, updated: false })
				return
			}

			const itemsPerRun = activity.products[0].quantity

			nodes.push({ typeId: typeId, itemsPerRun: itemsPerRun, updated: false })
			for (const material of activity.materials) {
				const link = {
					target: typeId,
					source: material.typeId,
					quantity: material.quantity
				}
				await processNode(link.source).then(() => links.push(link))
			}
			//
			// return await Promise.all(
			// 	activity.materials
			// 		.map((it) => ({
			// 			target: typeId,
			// 			source: it.typeId,
			// 			quantity: it.quantity
			// 		}))
			// 		.map((link) => processNode(link.source).then(() => links.push(link)))
			// )
		}

		const updateQuantities = (typeId: TypeId) => {
			const node = nodes.find((node) => node.typeId === typeId)

			const sourceLinks = links.filter((link) => link.source === typeId)

			if (node == null) return
			if (node.updated) return

			node.updated = true

			sourceLinks.forEach((link) => updateQuantities(link.target))
			const demand = originTypeId !== typeId ? sourceLinks.reduce((sum, { quantity }) => sum + quantity, 0) : 1
			const runs = Math.ceil(demand / node.itemsPerRun)

			const targetLinks = links.filter((link) => link.target === typeId)
			targetLinks.forEach((link) => (link.quantity = link.quantity * runs))
			targetLinks.forEach((link) => updateQuantities(link.source))
		}

		await processNode(typeId)
		updateQuantities(typeId)

		return { nodes, links, origin: nodes.find((it) => it.typeId === typeId) }
	}
}
