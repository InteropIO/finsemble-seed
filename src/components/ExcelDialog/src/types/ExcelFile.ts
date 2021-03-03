import IFile from './IFile'

export default class ExcelFile implements IFile {
    fileName: String;
    filePath: String;
    createTimestamp: number;
    aliveTimestamp: number;

    constructor(fileName: String, filePath: String, createTimestamp: number, aliveTimestamp: number) {
        this.fileName = fileName;
        this.filePath = filePath;
        this.createTimestamp = createTimestamp;
        this.aliveTimestamp = aliveTimestamp;
    }
}