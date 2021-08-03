import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { IColumn } from 'office-ui-fabric-react';
import ExcelBookmark from '../../../services/OfficeAddin/types/ExcelBookmark';

export default interface AppState {
    fileName: string;
    filePath: string;
    bookmarkName: string;
    range: string;
    openEndedRange: boolean;
    worksheetList: IDropdownOption[];
    worksheet: string;
    bookmarkCol: IColumn[];
    bookmarks: ExcelBookmark[];
    pivotSelectedKey: string;
    btnLabel: string;
    bookmarkToEdit: ExcelBookmark | null;
}