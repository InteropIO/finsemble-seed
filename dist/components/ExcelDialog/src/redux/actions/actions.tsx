import ExcelBookmark from "../../../../../services/OfficeAddin/types/ExcelBookmark";
import ExcelFile from "../../../../../services/OfficeAddin/types/ExcelFile";
import ExcelWorksheet from "../../../../../services/OfficeAddin/types/ExcelWorksheet";
import * as CONSTANTS from './actionTypes';

export const sheetChangeEvent = (sheetChangeEvent: {}) => {
    return {
        type: CONSTANTS.SHEET_CHANGE,
        payload: {
            sheetChangeEvent: sheetChangeEvent
        }
    }
}

export const getActiveExcelFiles = (activeExcelFiles: Array<ExcelFile>) => {
    return {
        type: CONSTANTS.GET_ACTIVE_EXCEL_FILES,
        payload: {
            activeExcelFiles: activeExcelFiles
        }
    }
}

export const setSelectedPreviousExcelFiles = (selectedPreviousExcelFiles: Array<ExcelFile>) => {
    return {
        type: CONSTANTS.SET_SELECTED_PREVIOUS_EXCEL_FILES,
        payload: {
            selectedPreviousExcelFiles: selectedPreviousExcelFiles
        }
    }
}

export const setSelectedActiveExcelFile = (selectedActiveExcelFile: ExcelFile | null) => {
    return {
        type: CONSTANTS.SET_SELECTED_ACTIVE_EXCEL_FILES,
        payload: {
            selectedActiveExcelFile: selectedActiveExcelFile
        }
    }
}


export const setGetExcelCellDataActionModalDisplay = (modalDisplay: string) => {
    return {
        type: CONSTANTS.GET_EXCEL_CELL_DATA_MODAL_DISPLAY,
        payload: {
            getExcelCellDataModalDisplay: modalDisplay
        }
    }
}



export const setSetExcelCellDataActionModalDisplay = (modalDisplay: string) => {
    return {
        type: CONSTANTS.SET_EXCEL_CELL_DATA_MODAL_DISPLAY,
        payload: {
            setExcelCellDataModalDisplay: modalDisplay
        }
    }
}

export const setSelectedWorksheet = (selectedWorksheet: ExcelWorksheet | null) => {
    return {
        type: CONSTANTS.SET_SELECTED_WORKSHEET,
        payload: {
            selectedWorksheet: selectedWorksheet
        }
    }
}

export const setOpenWorksheet = (openWorksheet: ExcelWorksheet | null) => {
    return {
        type: CONSTANTS.SET_OPEN_WORKSHEET,
        payload: {
            openWorksheet: openWorksheet
        }
    }
}

export const setSelectedClipboardData = (selectedClipboardData: []) => {
    return {
        type: CONSTANTS.SET_SELECTED_CLIPBOARD_DATA,
        payload: {
            selectedClipboardData: selectedClipboardData
        }
    }
}

export const setRange = (range: string) => {
    return {
        type: CONSTANTS.SET_RANGE,
        payload: {
            range: range
        }
    }
}

export const setSelectedBookmark = (selectedBookmark: ExcelBookmark) => {
    return {
        type: CONSTANTS.SET_SELECTED_BOOKMARK,
        payload: {
            selectedBookmark: selectedBookmark
        }
    }
}
