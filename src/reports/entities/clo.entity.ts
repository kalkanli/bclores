export class CLO {

    constructor(
        public surveyCLOs: string[],
        public gradeCLOs: string[],
        public relatedSOs: string[]
    ) {
        if (surveyCLOs.length != gradeCLOs.length || gradeCLOs.length != relatedSOs.length) {
            throw "Something wrong with clo values.";
        }
    }
}
