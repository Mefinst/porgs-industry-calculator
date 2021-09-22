import { ItemsButch } from '../../entities/industry-activity.entity'
import { TypeId } from '../../entities/type.entity'

export interface CalculateManufacturingCostQuery {
	calculateManufacturingCost(typeId: TypeId, quantity: number): Promise<ItemsButch[]>
}
