import ExcelFile from "../../types/ExcelFile"

export const OFFICE_ADDIN_REGISTER = 'OFFICE_ADDIN_REGISTER'

export const SUBSCRIBE_ACTIVE_EXCEL_FILES = 'SUBSCRIBE_ACTIVE_EXCEL_FILES'
export const SUBSCRIBE_SHEET_CHANGE = 'SUBSCRIBE_SHEET_CHANGE'

export const GET_ACTIVE_EXCEL_FILES = 'GET_ACTIVE_EXCEL_FILES'
export const SET_SELECTED_ACTIVE_EXCEL_FILES = 'SET_SELECTED_ACTIVE_EXCEL_FILES'

export const GET_PREVIOUS_EXCEL_FILES = 'GET_PREVIOUS_EXCEL_FILES'
export const SET_SELECTED_PREVIOUS_EXCEL_FILES = 'SET_SELECTED_PREVIOUS_EXCEL_FILES'

export const GET_EXCEL_CELL_DATA = 'GET_EXCEL_CELL_DATA'
export const GET_EXCEL_CELL_DATA_MODAL_DISPLAY = 'GET_EXCEL_CELL_DATA_MODAL_DISPLAY'

export const SAVE_EXCEL_WORKBOOK = "SAVE_EXCEL_WORKBOOK"

export const SET_EXCEL_CELL_DATA = 'SET_EXCEL_CELL_DATA'
export const SET_EXCEL_CELL_DATA_MODAL_DISPLAY = 'SET_EXCEL_CELL_DATA_MODAL_DISPLAY'

export const SHEET_CHANGE = "SHEET_CHANGE"

export const GET_WORKSHEET_LIST = "GET_WORKSHEET_LIST"
export const SET_TARGET_WORKSHEET = "SET_TARGET_WORKSHEET"
export const SET_OPEN_WORKSHEET = ' "SET_OPEN_WORKSHEET"'
export const SET_SELECTED_CLIPBOARD_DATA = 'SET_SELECTED_CLIPBOARD_DATA'
export const SET_RANGE = 'SET_RANGE'

export const SET_SELECTED_BOOKMARK = 'SET_SELECTED_BOOKMARK'

export const PASTE_TO_EXCEL = "PASTE_TO_EXCEL"
export const FOCUS_RANGE = 'FOCUS_RANGE'
export const CLEAR_RANGE = 'CLEAR_RANGE'
export const COPY_RANGE = 'COPY_RANGE'

export const BROADCAST_DATA = 'BROADCAST_DATA'


interface OfficeAddinRegisterAction {
    type: typeof OFFICE_ADDIN_REGISTER,
    payload: {
        regsiteredActions: []
    }
}

interface GetActiveExcelFilesAction {
    type: typeof GET_ACTIVE_EXCEL_FILES,
    payload: {
        activeExcelFiles: Array<ExcelFile>
    }
}

interface SetSelectedActiveExcelFilesAction {
    type: typeof SET_SELECTED_ACTIVE_EXCEL_FILES,
    payload: {
        selectedActiveExcelFile: ExcelFile
    }
}
interface GetPreviousExcelFilesAction {
    type: typeof GET_PREVIOUS_EXCEL_FILES,
    payload: {
        previousExcelFiles: Array<ExcelFile>
    }
}

interface SetSelectedPreviousExcelFilesAction {
    type: typeof SET_SELECTED_PREVIOUS_EXCEL_FILES,
    payload: {
        selectedPreviousExcelFiles: Array<ExcelFile>
    }
}

interface GetExcelCellDataAction {
    type: typeof GET_EXCEL_CELL_DATA,
    payload: {
        excelCellData: {}
    }
}

interface SetGetExcelCellDataActionModalDisplay {
    type: typeof GET_EXCEL_CELL_DATA_MODAL_DISPLAY,
    payload: {
        getExcelCellDataModalDisplay: ""
    }
}

interface SetSetExcelCellDataActionModalDisplay {
    type: typeof SET_EXCEL_CELL_DATA_MODAL_DISPLAY,
    payload: {
        setExcelCellDataModalDisplay: ""
    }
}

interface SheetChange {
    type: typeof SHEET_CHANGE,
    payload: {
        sheetChangeEvent: {}
    }
}

interface GetWorksheetList {
    type: typeof GET_WORKSHEET_LIST,
    payload: {
        worksheetList: Array<String>
    }
}

interface SetTargetWorksheet {
    type: typeof SET_TARGET_WORKSHEET
    payload: {
        targetWorksheet: ""
    }
}

interface SetOpenWorksheet {
    type: typeof SET_OPEN_WORKSHEET
    payload: {
        openWorksheet: ""
    }
}

interface setSelectedClipboardData {
    type: typeof SET_SELECTED_CLIPBOARD_DATA,
    payload: {
        selectedClipboardData: {}
    }
}

interface setRange {
    type: typeof SET_RANGE,
    payload: {
        range: ''
    }
}

interface setSelectedBookmark {
    type: typeof SET_SELECTED_BOOKMARK,
    payload: {
        selectedBookmark: {}
    }
}

export type OfficeAddinActionType = OfficeAddinRegisterAction
export type ExcelFileListActionType = setSelectedBookmark | setRange | setSelectedClipboardData | SetOpenWorksheet | SetTargetWorksheet | GetWorksheetList | SheetChange | SetGetExcelCellDataActionModalDisplay | SetSelectedActiveExcelFilesAction | GetActiveExcelFilesAction | GetExcelCellDataAction | GetPreviousExcelFilesAction | SetSelectedPreviousExcelFilesAction | SetSetExcelCellDataActionModalDisplay