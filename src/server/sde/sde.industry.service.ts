import { LoadTypePort } from '../../common/domains/industry/ports/out/load-type.port'
import { LoadBlueprintPort } from '../../common/domains/industry/ports/out/load-blueprint.port'
import { TypeEntity, TypeId } from '../../common/domains/industry/entities/type.entity'
import { BlueprintEntity, BlueprintId } from '../../common/domains/industry/entities/blueprint.entity'
import { IndustryActivityEntity } from '../../common/domains/industry/entities/industry-activity.entity'
import { SdeType } from './sde.type'
import { SdeBlueprint } from './sde.blueprint'
import { Injectable, Logger, OnModuleInit } from '@nestjs/common'

const { readFile } = require('fs')
const { join } = require('path')
const yaml = require('js-yaml')
@Injectable()
export class SdeIndustryService implements LoadTypePort, LoadBlueprintPort, OnModuleInit {
	private _types: Map<string, SdeType>
	private _blueprints: Map<string, SdeBlueprint>

	private _logger = new Logger(SdeIndustryService.name)

	constructor() {}

	async onModuleInit(): Promise<any> {
		this._logger.log('Initializing')
		;[this._types, this._blueprints] = await Promise.all([this._readTypesFile(), this._readBlueprintsFile()])
		this._logger.log('Initialized')
	}

	async loadBlueprint(productId: TypeId): Promise<BlueprintEntity> {
		const blueprints: Map<string, SdeBlueprint> = this._blueprints
		const response = Array.from(blueprints.values()).find((it) =>
			Array.from(Object.values(it.activities)).find((it) =>
				it.products ? it.products.find((it) => it.typeID === Number(productId)) : false
			)
		)

		if (response == null) return null

		const activities: Map<string, IndustryActivityEntity> = new Map(
			Object.entries(response.activities).map(([key, value]) => [
				key,
				new IndustryActivityEntity(
					(value.products || []).map((it) => ({
						typeId: it.typeID,
						quantity: it.quantity
					})),
					(value.materials || []).map((it) => ({
						typeId: it.typeID,
						quantity: it.quantity
					})),
					value.time
				)
			])
		)
		return new BlueprintEntity(response.blueprintTypeID, activities)
	}

	async loadType(id: TypeId): Promise<TypeEntity> {
		const response = this._types.get(String(id))

		return new TypeEntity(id, response.name.en, response.description.en)
	}

	private async _readBlueprintsFile(): Promise<Map<string, SdeBlueprint>> {
		const mappedObject: { [key: string]: SdeBlueprint } = await this._readYaml(join('./sde/fsd/blueprints.yaml'))
		return new Map<string, SdeBlueprint>(Object.entries(mappedObject))
	}

	private async _readTypesFile(): Promise<Map<string, SdeType>> {
		const mappedObject: { [key: string]: SdeType } = await this._readYaml(join('./sde/fsd/typeIDs.yaml'))
		return new Map<string, SdeType>(Object.entries(mappedObject))
	}

	private _readYaml<T>(path: string): Promise<T> {
		return new Promise<T>((resolve, reject) => {
			readFile(join(path), 'utf-8', (error, data) => {
				if (error) reject(error)
				else resolve(yaml.load(data.toString()))
			})
		})
	}
}
