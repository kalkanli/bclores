import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ReportsModule } from './reports/reports.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from './reports/entities/report.entity';
import { AuthModule } from './auth/auth.module';

@Module({
	imports: [
		ReportsModule,
		TypeOrmModule.forRoot({
			type : "sqlite",
			database: "clores.db",
			entities: [Report],
			synchronize: true
		  }),
		AuthModule
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule { }
