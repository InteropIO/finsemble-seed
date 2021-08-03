import ExcelBookmark from "./ExcelBookmark";
import ExcelFile from "./ExcelFile";

export default interface ExcelAction {
    action: string
    id: string
    file: ExcelFile | null
    bookmark: ExcelBookmark | null
}