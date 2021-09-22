import { Module } from '@nestjs/common'
import { SdeIndustryService } from '../sde/sde.industry.service'
import { IndustryController } from './industry.controller'
import { LOAD_BLUEPRINTS_PORT, LOAD_TYPES_PORT } from './industry.module.constants'

const SDE_INDUSTRY_SERVICE = Symbol('SdeIndustryService')
@Module({
	providers: [
		{ provide: SDE_INDUSTRY_SERVICE, useClass: SdeIndustryService },
		{ provide: LOAD_BLUEPRINTS_PORT, useExisting: SDE_INDUSTRY_SERVICE },
		{ provide: LOAD_TYPES_PORT, useExisting: SDE_INDUSTRY_SERVICE }
	],
	controllers: [IndustryController],
	imports: []
})
export class IndustryAppModule {}
