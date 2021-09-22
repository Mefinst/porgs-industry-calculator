import { TypeEntity, TypeId } from '../../entities/type.entity'

export interface LoadTypePort {
	loadType(id: TypeId): Promise<TypeEntity>
}
