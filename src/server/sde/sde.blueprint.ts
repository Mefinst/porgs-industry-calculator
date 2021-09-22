export type SdeBlueprint = {
	blueprintTypeID: number
	activities: {
		[name: string]: {
			materials: Array<{
				typeID: number
				quantity: number
			}>
			products: Array<{
				typeID: number
				quantity: number
			}>
			time: number
			skills: Array<{
				level: number
				typeID: number
			}>
		}
	}
	maxProductionLimit: number
}
