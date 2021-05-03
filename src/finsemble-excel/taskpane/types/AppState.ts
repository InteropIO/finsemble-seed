import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { IColumn } from 'office-ui-fabric-react';
import Bookmark from './Bookmark'

export default interface AppState {
    fileName: string;
    filePath: string;
    bookmarkName: string;
    range: string;
    openEndedRange: boolean;
    worksheetList: IDropdownOption[];
    worksheet: string;
    bookmarkCol: IColumn[];
    bookmarks: Bookmark[];
    pivotSelectedKey: string;
    btnLabel: string;
    bookmarkToEdit: Bookmark;
}