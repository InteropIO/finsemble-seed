import ExcelFile from "./ExcelFile";

export interface action {
    action: string
    id: string
    file: ExcelFile | null
}