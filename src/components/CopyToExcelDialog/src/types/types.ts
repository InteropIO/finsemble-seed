import ExcelFile from "./ExcelFile";

export interface ExcelAction {
    action: string
    id: string
    file: ExcelFile | null
}

export interface Bookmark {
    worksheet: string
    range: string
    bookmarkName: string
    fileName: string
    excelFile: ExcelFile
}