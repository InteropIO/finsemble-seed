import ExcelFile from "./ExcelFile";
import ExcelWorksheet from "./ExcelWorksheet";

export default interface ExcelBookmark {
    id: string
    worksheet: ExcelWorksheet
    range: string
    name: string
    openEndedRange: boolean
    excelFile: ExcelFile | null
}