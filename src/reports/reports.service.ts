import { Injectable } from '@nestjs/common';
import { Report } from './entities/report.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PC } from './entities/pc.entity';
import { CLO } from './entities/clo.entity';

@Injectable()
export class ReportsService {
	constructor(@InjectRepository(Report) private reportRepository: Repository<Report>) { }

	public async processExcel(): Promise<void> {
		const report = new Report(
			'2020-FALL-CMPE230-clo-pc-data.xlsx',
			'2020-FALL',
			'OZTURAN',
			'CMPE230'
		);
		report.parseExcelFile()
		await this.reportRepository.save(report)
	}

	private async excelHealthCheck(): Promise<void> {
		// TODO: implement
	}

	public async getReports(course: string) {
		return await this.reportRepository.find({where: {course: course}})
	}

	public async calculateCollectiveCLOs(semester: string) {
		const reports = await this.reportRepository.find({where: {semester: semester}});
		
		const PCPrefix = ["(1,9)", "(2)", "(3)", "(4)", "(5)", "(6)", "(7)", "(8)", "(10)", "(11)"]
		const PCs = Array.apply(null, Array(65)).map(() => []);
		const PCsAverage = Array.apply(null, Array(65)).map(() => 0);
		const cumPCCounts = [0, 5, 9, 16, 27, 32, 37, 42, 44, 59];
		
		const CLOs = Array.apply(null, Array(11)).map(() => []);
		const CLOsAverage = Array.apply(null, Array(11)).map(() => 0);


		reports.forEach(report => {
			const clo: CLO = JSON.parse(report.cloEncoded);
			for (let i = 0; i < clo.gradeCLOs.length; i++) {
				let relatedSOs = clo.relatedSOs[i];
				for (let j = 0; j < relatedSOs.length; j++) {
					CLOs[parseInt(relatedSOs[j])-1].push(clo.gradeCLOs[i]);
				}
			}

			const pc: PC = JSON.parse(report.pcEncoded);
			for (let i = 0; i < pc.pcIndices.length; i++) {
				let tokens = pc.pcIndices[i].split('.');
				let prefix = tokens[0];
				let index = tokens[1];
				PCs[cumPCCounts[PCPrefix.indexOf(prefix)] + parseInt(index) - 1].push(pc.pcs[i]);
			}
		});

		for (let i = 0; i < PCs.length; i++) {
			let sum = 0;
			for (let j = 0; j < PCs[i].length; j++) {
				sum += parseFloat(PCs[i][j]);
			}
			PCsAverage[i] = sum / PCs[i].length;
		}

		for (let i = 0; i < CLOs.length; i++) {
			let sum = 0;
			for (let j = 0; j < CLOs[i].length; j++) {
				sum += parseFloat(CLOs[i][j]);
			}
			CLOsAverage[i] = sum / CLOs[i].length;
		}

		return {
			clos: CLOsAverage,
			pcs: PCsAverage
		}
	}
}
