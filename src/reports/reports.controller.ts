import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

const editFileName = (req, file, callback) => {
	const name = file.originalname.split('.')[0];
	callback(null, `${name}.xlsx`);
};

@Controller('reports')
export class ReportsController {
	constructor(private readonly reportsService: ReportsService) { }

	@Post('/upload')
	@UseInterceptors(FileInterceptor('file', {
		storage: diskStorage({
			destination: './uploads/',
			filename: editFileName
		}),
	}))
	async create(@Body() request, @UploadedFile() file: Express.Multer.File) {
		this.reportsService.processExcel(file.filename, request.semester, request.instructor, request.courseCode)
		return 200;
	}

	@Get(':semester')
	async getCourseReports(@Param('semester') semester: string) {
		return await this.reportsService.getReports(semester);
	}

	@Get('/collective/:semester')
	async getCollectivePCsAndCLOs(@Param('semester') semester: string) {
		return await this.reportsService.calculateCollectiveCLOs(semester);
	}
}
