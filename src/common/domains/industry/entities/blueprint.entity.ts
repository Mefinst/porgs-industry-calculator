import { TypeId } from './type.entity'
import { IndustryActivityEntity } from './industry-activity.entity'

export type BlueprintId = TypeId | Symbol

export class BlueprintEntity {
	constructor(private _id: BlueprintId, private _activities: Map<string, IndustryActivityEntity>) {}

	get id(): BlueprintId {
		return this._id
	}

	get activities(): Map<string, IndustryActivityEntity> {
		return this._activities
	}
}
