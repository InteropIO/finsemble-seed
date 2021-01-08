import ExcelFile from "../../types/ExcelFile"

export const GET_EXCEL_FILE_LIST = 'GET_EXCEL_FILE_LIST'

export const OFFICE_ADDIN_REGISTER = 'OFFICE_ADDIN_REGISTER'

interface OfficeAddinRegisterAction  {
    type: typeof OFFICE_ADDIN_REGISTER,
    payload :{
        regsiteredActions: []
    }
}

interface GetExcelFileListAction {
    type: typeof GET_EXCEL_FILE_LIST,
    payload: {
        excelFileList: Array<ExcelFile>
    }
}

export type OfficeAddinActionType = OfficeAddinRegisterAction
export type ExcelFileListActionType = GetExcelFileListAction