import { Controller, Get, Post, Body, Param, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateLatexDTO } from './dtos/create-latex.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

const editFileName = (req, file, callback) => {
	const name = file.originalname.split('.')[0];
	callback(null, `${name}.xlsx`);
};

@Controller('reports')
export class ReportsController {
	constructor(private readonly reportsService: ReportsService) { }


	@Get('/collective-reports')
	async getAllCollectiveResults() {
		return await this.reportsService.getAllCollectiveCLOsAndPCs();
	}

	@Post('/upload')
	@UseInterceptors(FileInterceptor('file', {
		storage: diskStorage({
			destination: './uploads/',
			filename: editFileName
		}),
	}))
	async create(@Body() request, @UploadedFile() file: Express.Multer.File) {
		await this.reportsService.processExcel(file.filename, request.semester, request.instructor, request.courseCode)
		return 200;
	}

	@Get('/all')
	async getCourseReports() {
		return await this.reportsService.getReports();
	}

	@Post('/latex')
	async getReportAsLatex(@Body() dto: CreateLatexDTO) {
		return await this.reportsService.createLatexReport(dto);
	}

	@Post('timestamp/:id/:txID')
	async timestampReport(@Param('id') id: number, @Param('txID') txID: string) {
		console.log(id, txID)
		return await this.reportsService.timestampReport(id, txID);
	}
}
