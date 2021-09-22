export enum Language {
	de = 'de',
	en = 'en',
	fr = 'fr',
	ru = 'ru',
	zh = 'zh'
}
export type InternationalizedString = {
	[language: string]: string
}
export type SdeType = {
	basePrice: number
	capacity: number
	graphicID: number
	groupID: number
	marketGroupID: number
	mass: number

	name: InternationalizedString
	description: InternationalizedString

	portionSize: number
	published: boolean
	radius: number
	sofFactionName: string
	volume: number
}
