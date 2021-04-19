import Bookmark from "./Bookmark";
import ExcelFile from "./ExcelFile";

export default interface ExcelAction {
    action: string
    id: string
    file: ExcelFile | null
    bookmark: Bookmark | null
}