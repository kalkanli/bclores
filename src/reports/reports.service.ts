import { Injectable } from '@nestjs/common';
import { Report } from './entities/report.entity';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PC } from './entities/pc.entity';
import { CLO } from './entities/clo.entity';
import { CreateLatexDTO } from './dtos/create-latex.dto';
import { PythonShell } from 'python-shell';
const crypto = require('crypto');
const fs = require('fs');

@Injectable()
export class ReportsService {
	constructor(@InjectRepository(Report) private reportRepository: Repository<Report>) { }

	public async processExcel(fileName, semester, instructor, course): Promise<void> {
		const file = fs.readFileSync('../clores/2021-SPRING-CMPE230-clo-pc-data.xlsx');
		const checksum = crypto.createHash('md5').update(file).digest("hex");
		const report = new Report(
			fileName,
			semester,
			instructor,
			course,
			'pending',
			checksum
		);
		report.parseExcelFile()
		await this.reportRepository.save(report)
	}

	public async getReports() {
		return await this.reportRepository.find()
	}

	public async getAllCollectiveCLOsAndPCs() {
		let year = 2020;
		const results = [];
		
		for(let i=0; i<3; i++) {
			const result = await this.calculateCollectiveCLOsAndPCs(`${year}-${year+1}`);
			if(result != null) {
				results.push(result);
			}
		}
		return results;
	}

	public async calculateCollectiveCLOsAndPCs(year: string) {
		const tokens = year.split('-');
		const semesters = [`${tokens[0]}-FALL`, `${tokens[1]}-SPRING`];

		const reports = await this.reportRepository.find({ where: { semester: In(semesters) } });
		if(reports.length == 0) return null;

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
					CLOs[parseInt(relatedSOs[j]) - 1].push(clo.gradeCLOs[i]);
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
			year: year,
			clos: CLOsAverage,
			pcs: PCsAverage
		}
	}

	public async createLatexReport(dto: CreateLatexDTO) {
		let reportType = dto.type;
		let filter = { semester: In(dto.semesters) }
		if(dto.courses) {
			filter['course'] = In(dto.courses);
		}
		const reports = await this.reportRepository.find({where: filter});
		const reportIds = [];
		let cloresFeed = [];
		for (let i = 0; i < reports.length; i++) {
			const report = reports[i];
			reportIds.push(report.id);
			cloresFeed.push(`${report.semester}>${report.course}>${report.instructor}`);
		}
		const options = {
			pythonPath: '../clores/env/bin/python3',
			scriptPath: '../clores/src/',
			args: [`--`+reportType, `--f1=${dto.semesters.join(',')}`, `--f2=${cloresFeed.join(',')}`]
		}
		if (reportType == 'cpc' || reportType == 'cclo') {
			let years = [];
			for (let i = 0; i < dto.semesters.length; i++) {
				let year = dto.semesters[i].split('-')[0];
				if (!years.includes(year)) years.push(year);
			}
			if (years.length != 3) {
				throw "cannot collective year";
			}
			years = [years[0] + '-' + years[1], years[1] + '-' + years[2]];
			options.args.push('--f3=' + years.join(','));
		}
		const results = await PythonShell.run('clores421.py', options);
		return {
			ids: reportIds,
			report: results.join('\n')
		}
	}

	public async timestampReport(id: number, txID: string): Promise<void> {
		const report = await this.reportRepository.findOne({where: {id}});
		report.status = 'certified';
		report.txID = txID;
		await this.reportRepository.save(report);
	}
}