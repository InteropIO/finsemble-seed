import { Action } from "redux";
import { ThunkAction } from "redux-thunk";
import { RootState } from "./../store"
import { GET_EXCEL_FILE_LIST, GET_EXCEL_CELL_DATA, OFFICE_ADDIN_REGISTER } from './actionTypes';
import ExcelFile from './../../types/ExcelFile';


export const officeAddinRegister = (regsiteredActions: []) => {
    return {
        type: OFFICE_ADDIN_REGISTER,
        payload: {
            regsiteredActions: regsiteredActions,
        }
    }
}

export const getExcelFileListThunk = (actionId: string): ThunkAction<void, RootState, null, Action<string>> => async dispatch => {
    if (!actionId || actionId == '') {
        FSBL.Clients.RouterClient.query(OFFICE_ADDIN_REGISTER, { actions: [GET_EXCEL_FILE_LIST] }, (err, res) => {
            dispatch(officeAddinRegister(res.data.data))
            FSBL.Clients.RouterClient.query(res.data.data[0].id, {}, (err, res) => { 
                dispatch(getExcelFileList(res.data.data))
            })
        })
    } else {
        dispatch(getExcelFileListFromService(actionId))
    }
};

export const getExcelFileListFromService = (actionId: string): ThunkAction<void, RootState, null, Action<string>> => async dispatch => {
    FSBL.Clients.RouterClient.query(actionId, {}, (err, res) => { 
        dispatch(getExcelFileList(res.data.data))
    })
}

export const getExcelFileList = (excelFileList: Array<ExcelFile>) => {
    return { 
        type: GET_EXCEL_FILE_LIST,
        payload:{
            excelFileList: excelFileList
        }
    }
}

export const getExcelCellDataThunk = (actionId: string, excelFiles: Array<ExcelFile>): ThunkAction<void, RootState, null, Action<string>> => async dispatch => {
    if (!actionId || actionId == '') {
        FSBL.Clients.RouterClient.query(OFFICE_ADDIN_REGISTER, { actions: [GET_EXCEL_CELL_DATA], excelFiles: excelFiles }, (err, res) => {
            dispatch(officeAddinRegister(res.data.data))
        })
    } else {
        dispatch(getExcelCellDataFromService(actionId, excelFiles))
    }
};

export const getExcelCellDataFromService = (actionId: string, excelFiles: Array<ExcelFile>): ThunkAction<void, RootState, null, Action<string>> => async dispatch => {
    FSBL.Clients.RouterClient.query(actionId, {}, (err, res) => { 
        dispatch(getExcelFileList(res.data.data))
    })
}

export const getExcelCellData = (excelCellData: any) => {
    return { 
        type: GET_EXCEL_CELL_DATA,
        payload:{
            excelCellData: excelCellData
        }
    }
}
