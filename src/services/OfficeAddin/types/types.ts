import ExcelFile from "./ExcelFile";

export interface ExcelAction {
    action: string
    id: string
    file: ExcelFile | null
}