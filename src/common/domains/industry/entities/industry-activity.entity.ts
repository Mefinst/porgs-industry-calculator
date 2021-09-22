import { TypeId } from './type.entity'

export type ItemsButch = {
	typeId: TypeId
	quantity: number
}
export class IndustryActivityEntity {
	constructor(private _products: ItemsButch[], private _materials: ItemsButch[], private _time: number) {}

	get products(): ItemsButch[] {
		return this._products || []
	}

	get materials(): ItemsButch[] {
		return this._materials || []
	}

	get time(): number {
		return this._time
	}
}
