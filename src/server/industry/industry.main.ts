import { NestFactory } from '@nestjs/core'
import { IndustryAppModule } from './industry.app.module'

async function bootstrap() {
	const app = await NestFactory.create(IndustryAppModule)
	await app.listen(3000)
}

bootstrap()
