import ExcelFile from "./ExcelFile";
import ExcelWorksheet from "./ExcelWorksheet";

export default interface ExcelActionResult {
    action: string;
    result: "DONE"|"FAILED"|"SUBSCRIBED";
    worksheet?: ExcelWorksheet;
    worksheets?: Array<ExcelWorksheet>;
    range?: string;
    values?: Array<Array<string>>;
    file?: ExcelFile;
}