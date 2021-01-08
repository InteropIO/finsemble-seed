import { GET_EXCEL_FILE_LIST, ExcelFileListActionType } from '../actions/actionTypes';
import ExcelFile from './../../types/ExcelFile';

const initialState = {
  excelFileList: Array<ExcelFile>()
}

export default (state = initialState, action: ExcelFileListActionType) => {
  switch (action.type) {
    case GET_EXCEL_FILE_LIST: {
      return {
        ...state,
        excelFileList: action.payload.excelFileList 
      };
    }
    default:
      return state;
  }
}