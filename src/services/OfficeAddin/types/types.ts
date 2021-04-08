import ExcelFile from "./ExcelFile";

export interface ExcelAction {
    action: string
    id: string
    file: ExcelFile | null
    bookmark: Bookmark | null
}

export interface Bookmark {
    worksheet: Worksheet
    range: string
    name: string
    openEndedRange: boolean
    excelFileName: string
    excelFile: ExcelFile
}

export interface Worksheet {
    id: string
    name: string
}