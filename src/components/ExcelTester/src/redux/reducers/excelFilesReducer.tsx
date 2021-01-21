import { GET_ACTIVE_EXCEL_FILES, GET_EXCEL_CELL_DATA, ExcelFileListActionType, GET_PREVIOUS_EXCEL_FILES, SET_SELECTED_PREVIOUS_EXCEL_FILES, SET_SELECTED_ACTIVE_EXCEL_FILES, GET_EXCEL_CELL_DATA_MODAL_DISPLAY } from '../actions/actionTypes';
import ExcelFile from './../../types/ExcelFile';

const initialState = {
  activeExcelFiles: Array<ExcelFile>(),
  selectedActiveExcelFiles: Array<ExcelFile>(),
  previousExcelFiles: Array<ExcelFile>(),
  selectedPreviousFiles: Array<ExcelFile>(),
  getExcelCellDataModalDisplay: "none",
  excelCellData: {}
}

export default (state = initialState, action: ExcelFileListActionType) => {
  switch (action.type) {
    case GET_ACTIVE_EXCEL_FILES:
      return {
        ...state,
        activeExcelFiles: action.payload.activeExcelFiles
      };
    case SET_SELECTED_ACTIVE_EXCEL_FILES:
      return {
        ...state,
        selectedActiveExcelFiles: action.payload.selectedActiveExcelFiles
      };

    case GET_PREVIOUS_EXCEL_FILES:
      // Filter out current active excel file
      let filteredPreviousExcelFiles: Array<ExcelFile> = []
      action.payload.previousExcelFiles.forEach((previousExcelFile) => {
        let tempExcelFile = state.activeExcelFiles.find((activeExcelFile) => {
          return activeExcelFile.fileName === previousExcelFile.fileName
        })
        if (!tempExcelFile)
          filteredPreviousExcelFiles.push(previousExcelFile)
      })
      return {
        ...state,
        previousExcelFiles: filteredPreviousExcelFiles
      };

    case SET_SELECTED_PREVIOUS_EXCEL_FILES:
      return {
        ...state,
        selectedPreviousExcelFiles: action.payload.selectedPreviousExcelFiles
      };

    case GET_EXCEL_CELL_DATA:
      return {
        ...state,
        excelCellData: action.payload.excelCellData
      };

    case GET_EXCEL_CELL_DATA_MODAL_DISPLAY:
      return {
        ...state,
        getExcelCellDataModalDisplay: action.payload.getExcelCellDataModalDisplay
      };

    default:
      return state;
  }
}