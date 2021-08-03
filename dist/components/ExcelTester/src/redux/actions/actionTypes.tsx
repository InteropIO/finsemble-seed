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
        selectedActiveExcelFiles: Array<ExcelFile>
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

export type OfficeAddinActionType = OfficeAddinRegisterAction
export type ExcelFileListActionType = SheetChange | SetGetExcelCellDataActionModalDisplay | SetSelectedActiveExcelFilesAction | GetActiveExcelFilesAction | GetExcelCellDataAction | GetPreviousExcelFilesAction | SetSelectedPreviousExcelFilesAction | SetSetExcelCellDataActionModalDisplay