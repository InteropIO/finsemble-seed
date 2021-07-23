import Worksheet from "./ExcelWorksheet";

export default interface ExcelValues {
    worksheet: Worksheet;
    range: string;
    values: Array<Array<string>>;
}