import { Action } from "redux";
import { ThunkAction } from "redux-thunk";
import { RootState } from "./../store"
import * as CONSTANTS from './actionTypes';
import ExcelFile from './../../types/ExcelFile';
import { Bookmark } from "../../types/types";


export const officeAddinRegister = (regsiteredActions: [], status: string) => {
    return {
        type: CONSTANTS.OFFICE_ADDIN_REGISTER,
        payload: {
            regsiteredActions: regsiteredActions,
        }
    }
}

export const registerActionThunk = (action: string, excelFiles?: Array<ExcelFile>): ThunkAction<void, RootState, null, Action<string>> => async dispatch => {
    FSBL.Clients.RouterClient.query(CONSTANTS.OFFICE_ADDIN_REGISTER, { actions: [action], excelFiles: excelFiles }, (err, res) => {
        dispatch(officeAddinRegister(res.data.data, res.data.status))
        switch (action) {
            case CONSTANTS.GET_ACTIVE_EXCEL_FILES:
                FSBL.Clients.RouterClient.query(res.data.data[0].id, {}, (err, res) => {
                    dispatch(getActiveExcelFiles(res.data.data))
                })
                break;

            case CONSTANTS.SUBSCRIBE_ACTIVE_EXCEL_FILES:
                FSBL.Clients.RouterClient.addListener(res.data.data[0].id, (err, res) => {
                    // Handle active excel files change
                    if (res) {
                        // Dispatch active excel files to reddux store
                        dispatch(getActiveExcelFiles(res.data.ACTIVE_EXCEL_FILES))
                        FSBL.Clients.WindowClient.getComponentState({ field: 'previousExcelFiles' }, (err, previousExcelFiles: Array<ExcelFile>) => {
                            if (previousExcelFiles) {
                                // Compare with previous excel file list to see if matches
                                res.data.ACTIVE_EXCEL_FILES.forEach((tempExcelFile: ExcelFile, index: number) => {
                                    let matchExcelFile = previousExcelFiles.find((previousExcelFile: ExcelFile, index) => {
                                        if (previousExcelFile.fileName === tempExcelFile.fileName) {
                                            // if matched, updated the file
                                            previousExcelFiles[index] = tempExcelFile
                                        }
                                        return previousExcelFile.fileName === tempExcelFile.fileName
                                    })
                                    if (!matchExcelFile) {
                                        // if not match add to previous files
                                        previousExcelFiles.push(tempExcelFile)
                                    }
                                })
                                // Save the previous excel files to component state
                                FSBL.Clients.WindowClient.setComponentState({ field: 'previousExcelFiles', value: previousExcelFiles })
                                // Dispatch previous excel file to redux store
                                dispatch(getPreviousExcelFiles(previousExcelFiles))
                            } else {
                                // If no previous excel files
                                FSBL.Clients.WindowClient.setComponentState({ field: 'previousExcelFiles', value: res.data.ACTIVE_EXCEL_FILES })
                                dispatch(getPreviousExcelFiles(res.data.ACTIVE_EXCEL_FILES))
                            }
                            dispatch(setSelectedActiveExcelFile(null))
                            dispatch(setOpenWorksheet(null))
                            dispatch(setTargetWorksheet(null))
                        })
                    }
                });
                break

            case CONSTANTS.SUBSCRIBE_SHEET_CHANGE:
                FSBL.Clients.RouterClient.addListener(res.data.data[0].id, (err, res: any) => {
                    if (res) {
                        let eventObj = res.data.event
                        eventObj.fileName = res.data.fileName
                        dispatch(sheetChangeEvent(eventObj))
                    }
                })
                break;
            default:
                break;
        }
    })
};

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

export const getActiveExcelFilesThunk = (actionId: string): ThunkAction<void, RootState, null, Action<string>> => async dispatch => {
    FSBL.Clients.RouterClient.query(actionId, {}, (err, res) => {
        dispatch(getActiveExcelFiles(res.data.data))
    })
};

export const getPreviousExcelFiles = (previousExcelFiles: Array<ExcelFile>) => {
    return {
        type: CONSTANTS.GET_PREVIOUS_EXCEL_FILES,
        payload: {
            previousExcelFiles: previousExcelFiles
        }
    }
}

export const getPreviousExcelFilesThunk = (): ThunkAction<void, RootState, null, Action<string>> => async dispatch => {
    // Retrieve previous excel files from component state
    FSBL.Clients.WindowClient.getComponentState({ field: 'previousExcelFiles' }, (err, previousExcelFiles) => {
        if (previousExcelFiles) {
            dispatch(getPreviousExcelFiles(previousExcelFiles))
        }
    })
};

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

export const getExcelCellData = (excelCellData: any) => {
    return {
        type: CONSTANTS.GET_EXCEL_CELL_DATA,
        payload: {
            excelCellData: excelCellData
        }
    }
}

export const getExcelCellDataThunk = (actionId: string, excelFile: ExcelFile, startCell: string, endCell: string, sheetName: string): ThunkAction<void, RootState, null, Action<string>> => async dispatch => {
    // Retrieve excel cell data from service 
    FSBL.Clients.RouterClient.query(actionId, { excelFile: excelFile, startCell: startCell, endCell: endCell, sheetName: sheetName }, (err, res) => {
        dispatch(getExcelCellData(res.data.data))
    })
};

export const setGetExcelCellDataActionModalDisplay = (modalDisplay: string) => {
    return {
        type: CONSTANTS.GET_EXCEL_CELL_DATA_MODAL_DISPLAY,
        payload: {
            getExcelCellDataModalDisplay: modalDisplay
        }
    }
}

export const saveExcelWorkbookThunk = (actionId: string, excelFile: ExcelFile): ThunkAction<void, RootState, null, Action<string>> => async dispatch => {
    FSBL.Clients.RouterClient.query(actionId, { excelFile: excelFile }, (err, res) => {
        dispatch(saveExcelWorkbookResult(res.data.data))
    });
}

export const saveExcelWorkbookResult = (saveWorkbookResult: any) => {
    return {
        type: CONSTANTS.SAVE_EXCEL_WORKBOOK,
        payload: {
            saveWorkbookResult: ''
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

export const setExcelCellDataThunk = (actionId: string, excelFile: ExcelFile, startCell: string, endCell: string, sheetName: string, values: Array<Array<string>>): ThunkAction<void, RootState, null, Action<string>> => async dispatch => {
    // Retrieve excel cell data from service 
    FSBL.Clients.RouterClient.query(actionId, { excelFile: excelFile, startCell: startCell, endCell: endCell, sheetName: sheetName, values: values }, (err, res) => {
        console.log(res)
        //dispatch(getExcelCellData(res.data.data))
    })
};

export const getWorksheetListThunk = (actionId: string, excelFile: ExcelFile): ThunkAction<void, RootState, null, Action<string>> => async dispatch => {
    if (actionId != ''){
        FSBL.Clients.RouterClient.query(actionId, { excelFile: excelFile }, (err, res) => {
            dispatch(getWorksheetList(res.data.data))
        });
    }
    else {
        dispatch(getWorksheetList([]))
    }
}

export const getWorksheetList = (worksheetList: Array<string>) => {
    return {
        type: CONSTANTS.GET_WORKSHEET_LIST,
        payload: {
            worksheetList: worksheetList
        }
    }
}

export const setTargetWorksheet = (targetWorksheet: any) => {
    return {
        type: CONSTANTS.SET_TARGET_WORKSHEET,
        payload: {
            targetWorksheet: targetWorksheet
        }
    }
}

export const setOpenWorksheet = (openWorksheet: any) => {
    return {
        type: CONSTANTS.SET_OPEN_WORKSHEET,
        payload: {
            openWorksheet: openWorksheet
        }
    }
}

export const setSelectedClipboardData = (selectedClipboardData: any) => {
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

export const copyToExcel = (actionId: string, targetExcelFile: ExcelFile, targeWorksheet: string, range: string, openWorksheet: string, data: []): ThunkAction<void, RootState, null, Action<string>> => async dispatch => {
    console.log(actionId, targetExcelFile, targeWorksheet, range, openWorksheet, data)
    
    
    
    
    // FSBL.Clients.RouterClient.query(actionId, { targetExcelFile: targetExcelFile, targeWorksheet: targeWorksheet, startCell: startCell, endCell: endCell, openWorksheet: openWorksheet, data: data }, (err, res) => {
    //     console.log(res)
    //     //dispatch(getExcelCellData(res.data.data))
    // })
};

export const setSelectedBookmark = (selectedBookmark: Bookmark) => {
    return {
        type: CONSTANTS.SET_SELECTED_BOOKMARK,
        payload: {
            selectedBookmark: selectedBookmark
        }
    }
}