import { Action } from "redux";
import { ThunkAction } from "redux-thunk";
import { RootState } from "./../store"
import { GET_ACTIVE_EXCEL_FILES, GET_EXCEL_CELL_DATA, GET_EXCEL_CELL_DATA_MODAL_DISPLAY, GET_PREVIOUS_EXCEL_FILES, OFFICE_ADDIN_REGISTER, SET_SELECTED_ACTIVE_EXCEL_FILES, SET_SELECTED_PREVIOUS_EXCEL_FILES, SUBSCRIBE_ACTIVE_EXCEL_FILES } from './actionTypes';
import ExcelFile from './../../types/ExcelFile';


export const officeAddinRegister = (regsiteredActions: []) => {
    return {
        type: OFFICE_ADDIN_REGISTER,
        payload: {
            regsiteredActions: regsiteredActions,
        }
    }
}

export const registerActionThunk = (action: string, excelFiles?: Array<ExcelFile>): ThunkAction<void, RootState, null, Action<string>> => async dispatch => {
    FSBL.Clients.RouterClient.query(OFFICE_ADDIN_REGISTER, { actions: [action], excelFiles: excelFiles }, (err, res) => {
        dispatch(officeAddinRegister(res.data.data))
        switch (action) {
            case GET_ACTIVE_EXCEL_FILES:
                FSBL.Clients.RouterClient.query(res.data.data[0].id, {}, (err, res) => {
                    dispatch(getActiveExcelFiles(res.data.data))
                })
                break;
            case SUBSCRIBE_ACTIVE_EXCEL_FILES:
                FSBL.Clients.RouterClient.addListener(res.data.data[0].id, (err, res) => {
                    // Handle active excel files change
                    if (res) {
                        // Dispatch active excel files to reddux store
                        dispatch(getActiveExcelFiles(res.data.ACTIVE_EXCEL_FILES))
                        FSBL.Clients.WindowClient.getComponentState({ field: 'previousExcelFiles' }, (err, previousExcelFiles: Array<ExcelFile>) => {
                            if (previousExcelFiles) {
                                // Compare with previous excel file list to see if matches
                                res.data.ACTIVE_EXCEL_FILES.forEach((tempExcelFile: ExcelFile) => {
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
                        })
                    }
                });
                break
            default:
                break;
        }

    })
};

export const getActiveExcelFiles = (activeExcelFiles: Array<ExcelFile>) => {
    return {
        type: GET_ACTIVE_EXCEL_FILES,
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
        type: GET_PREVIOUS_EXCEL_FILES,
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
        type: SET_SELECTED_PREVIOUS_EXCEL_FILES,
        payload: {
            selectedPreviousExcelFiles: selectedPreviousExcelFiles
        }
    }
}

export const setSelectedActiveExcelFiles = (selectedActiveExcelFiles: Array<ExcelFile>) => {
    return {
        type: SET_SELECTED_ACTIVE_EXCEL_FILES,
        payload: {
            selectedActiveExcelFiles: selectedActiveExcelFiles
        }
    }
}

export const getExcelCellData = (excelCellData: any) => {
    return {
        type: GET_EXCEL_CELL_DATA,
        payload: {
            excelCellData: excelCellData
        }
    }
}

export const getExcelCellDataThunk = (actionId: string, excelFile: ExcelFile, startCell: String, endCell: String, sheetName: String): ThunkAction<void, RootState, null, Action<string>> => async dispatch => {
    // Retrieve excel cell data from service 
    FSBL.Clients.RouterClient.query(actionId, { excelFile: excelFile, startCell: startCell, endCell: endCell, sheetName: sheetName }, (err, res) => {
        dispatch(getExcelCellData(res.data.data))
    })
};

export const setGetExcelCellDataActionModalDisplay = (modalDisplay: String) => {
    return {
        type: GET_EXCEL_CELL_DATA_MODAL_DISPLAY,
        payload: {
            getExcelCellDataModalDisplay: modalDisplay
        }
    }
}


