export class PC {
    constructor(
        public pcs: string[],
        public pcIndices: string[]
    ) {
        if (pcs.length != pcIndices.length) {
            throw "Something wrong with pc values.";
        }
    }
}
