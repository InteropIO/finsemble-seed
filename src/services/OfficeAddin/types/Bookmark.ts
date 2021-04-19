import ExcelFile from "./ExcelFile";
import Worksheet from "./Worksheet";

export default interface Bookmark {
    id: string
    worksheet: Worksheet
    range: string
    name: string
    openEndedRange: boolean
    excelFile: ExcelFile
}