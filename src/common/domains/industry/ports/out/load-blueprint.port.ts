import { TypeId } from '../../entities/type.entity'
import { BlueprintEntity } from '../../entities/blueprint.entity'

export interface LoadBlueprintPort {
	loadBlueprint(productId: TypeId): Promise<BlueprintEntity>
}
