import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateLatexDTO } from './dtos/create-latex.dto';

@Controller('reports')
export class ReportsController {
	constructor(private readonly reportsService: ReportsService) { }

	@Get()
	async create() {
		await this.reportsService.processExcel()
	}

	@Get(':semester')
	async getCourseReports(@Param('semester') semester: string) {
		return await this.reportsService.getReports(semester);
	}

	@Get('/collective/:semester')
	async getCollectivePCsAndCLOs(@Param('semester') semester: string) {
		return await this.reportsService.calculateCollectiveCLOs(semester);
	}

	@Post('/latex')
	async getReportAsLatex(@Body() dto: CreateLatexDTO) {
		return await this.reportsService.createLatexReport(dto);
	}
}
