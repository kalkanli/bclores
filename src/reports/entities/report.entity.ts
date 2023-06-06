import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { CLO } from "./clo.entity";
import { PC } from "./pc.entity";
import xlsx from 'node-xlsx';

@Entity({ name: 'reports' })
export class Report {
    constructor(
        public path: string,
        semester: string,
        instructor: string,
        course: string,
        status: string = 'pending'
    ) {
        this.semester = semester;
        this.instructor = instructor;
        this.course = course;
        this.status = status;
    }

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    semester: string;
    @Column()
    course: string; 
    @Column()
    instructor: string;
    @Column()
    status: string;
    
    private N: number;

    private discretization: number[];

    @Column({name: 'pc'})
    public pcEncoded: string;
    @Column({name: 'clo'})
    public cloEncoded: string;
    
    private excel: any;

    @Column({name: 'excel_raw', nullable: true})
    public excelRaw?: string;


    public parseExcelFile(): void {
		this.excel = xlsx.parse(this.path);
        this.excelRaw = JSON.stringify(this.excel);

        this.setN();
        this.parseDiscretization();
		
        const surveyCLOs = this.getSurveyCLOs();
		const gradeCLOs = this.getGradeCLOs();
		const relatedSOs = this.getRelatedSOs();
		const pcIndices = this.getPCIndices();
		const pcs = this.getPCs();


		this.cloEncoded = JSON.stringify(new CLO(surveyCLOs, gradeCLOs, relatedSOs));
		this.pcEncoded = JSON.stringify(new PC(pcs, pcIndices));
    }

    private getSurveyCLOs(){
        let surveyCLOs = [];
        const cloSurveysSheet = this.getSheetData('clo-surveys');
		for (let i = 1; i < cloSurveysSheet.length; i++) {
			surveyCLOs.push(cloSurveysSheet[i][6]);
		}
        return surveyCLOs;
    }


    private getGradeCLOs() {
        const cloWeights = [];
        const cloWeightsSheet = this.getSheetData('CLO-weights');
		for (let i = 1; i < cloWeightsSheet.length; i++) {
            cloWeights.push(cloWeightsSheet[i].slice(2));
		}
        const gradeCLOs = Array.apply(null, Array(cloWeights.length)).map(() => 0);
        
        const gradesSheet = this.getSheetData('grades');
		for (let i = 1; i < gradesSheet.length; i++) {
			for (let l = 0; l < cloWeights.length; l++) {
				let studentTotal = 0;
				gradesSheet[i].forEach((grade, j) => {
					studentTotal += grade * cloWeights[l][j];
				});
				for (let k = 3; k > 0; k--) {
					if (studentTotal >= this.discretization[k]) {
						gradeCLOs[l] += k+1;
						break;
					}
				}
			}
        }

        return gradeCLOs.map(clo => (clo / this.N).toFixed(2));
    }

    private getPCIndices() {
        const pcIndices = [];
        const pcWeigthsSheet = this.getSheetData('PC-weights');
		for (let i = 1; i < pcWeigthsSheet.length; i++) {
			pcIndices.push(pcWeigthsSheet[i][1]);
		}
        return pcIndices;
    }

    private getPCs() {
        const pcWeights = [];
        const pcWeigthsSheet = this.getSheetData('PC-weights');
		for (let i = 1; i < pcWeigthsSheet.length; i++) {
			pcWeights.push(pcWeigthsSheet[i].slice(2));
		}

        const pcs =  Array.apply(null, Array(pcWeights.length)).map(() => 0);
        const gradesSheet = this.getSheetData('grades');
		for (let i = 1; i < gradesSheet.length; i++) {
			for (let l = 0; l < pcWeights.length; l++) {
				let studentTotal = 0;
				
                gradesSheet[i].forEach((grade, j) => {
					studentTotal += grade * pcWeights[l][j];
				});
				
                for (let k = 3; k > 0; k--) {
					if (studentTotal >= this.discretization[k]) {
						pcs[l] += k+1;
						break;
					}
				}
			}
		}
        return pcs.map(pc => (pc / this.N).toFixed(2));
    }

    private getRelatedSOs() {
        const relatedSOs = [];
        const cloWeightsSheet = this.getSheetData('CLO-weights');
		for (let i = 1; i < cloWeightsSheet.length; i++) {
			relatedSOs.push(cloWeightsSheet[i][1].substring(
				cloWeightsSheet[i][1].indexOf("(") + 1,
				cloWeightsSheet[i][1].lastIndexOf(")")
			).split(','));
		}
        return relatedSOs;
    }

    private getSheetData(sheetName: string): any {
		let sheetData = null;
		for (let i = 0; i < this.excel.length; i++) {
			if (this.excel[i].name == sheetName) {
				sheetData = this.excel[i].data;
			}
		}
		return sheetData;
	}

    private parseDiscretization(): void
    {
        const discretizationSheet = this.getSheetData('discretization');
		this.discretization = discretizationSheet[1];
    }

    private setN(): void
    {        
        const gradesSheet = this.getSheetData('grades');
        this.N = gradesSheet.length - 1;
    }
}
