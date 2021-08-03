import IFile from './IFile'

export default class ExcelFile implements IFile {
    fileName: string;
    filePath: string;
    createTimestamp: number;
    aliveTimestamp: number;

    constructor(fileName: string, filePath: string, createTimestamp: number, aliveTimestamp: number) {
        this.fileName = fileName;
        this.filePath = filePath;
        this.createTimestamp = createTimestamp;
        this.aliveTimestamp = aliveTimestamp;
    }
}