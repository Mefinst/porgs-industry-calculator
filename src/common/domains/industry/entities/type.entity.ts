export type TypeId = number

export class TypeEntity {
	get id(): TypeId {
		return this._id
	}

	get name(): string {
		return this._name
	}

	get description(): string {
		return this._description
	}
	constructor(private _id: TypeId, private _name: string, private _description: string) {}
}
