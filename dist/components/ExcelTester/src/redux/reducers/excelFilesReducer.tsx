import * as CONSTANTS from '../actions/actionTypes';
import { ExcelFileListActionType } from '../actions/actionTypes'
import ExcelFile from './../../types/ExcelFile';

const initialState = {
  activeExcelFiles: Array<ExcelFile>(),
  selectedActiveExcelFiles: Array<ExcelFile>(),
  previousExcelFiles: Array<ExcelFile>(),
  selectedPreviousFiles: Array<ExcelFile>(),
  getExcelCellDataModalDisplay: "none",
  excelCellData: {},
  sheetChangeEvent: {}
}

export default (state = initialState, action: ExcelFileListActionType) => {
  switch (action.type) {
    case CONSTANTS.GET_ACTIVE_EXCEL_FILES:
      return {
        ...state,
        activeExcelFiles: action.payload.activeExcelFiles
      };
    case CONSTANTS.SET_SELECTED_ACTIVE_EXCEL_FILES:
      return {
        ...state,
        selectedActiveExcelFiles: action.payload.selectedActiveExcelFiles
      };

    case CONSTANTS.GET_PREVIOUS_EXCEL_FILES:
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

    case CONSTANTS.SET_SELECTED_PREVIOUS_EXCEL_FILES:
      return {
        ...state,
        selectedPreviousExcelFiles: action.payload.selectedPreviousExcelFiles
      };

    case CONSTANTS.GET_EXCEL_CELL_DATA:
      return {
        ...state,
        excelCellData: action.payload.excelCellData
      };

    case CONSTANTS.GET_EXCEL_CELL_DATA_MODAL_DISPLAY:
      return {
        ...state,
        getExcelCellDataModalDisplay: action.payload.getExcelCellDataModalDisplay
      };
    case CONSTANTS.SET_EXCEL_CELL_DATA_MODAL_DISPLAY:
      return {
        ...state,
        setExcelCellDataModalDisplay: action.payload.setExcelCellDataModalDisplay
      };
    case CONSTANTS.SHEET_CHANGE:
      return{
        ...state,
        sheetChangeEvent: action.payload.sheetChangeEvent
      }
    default:
      return state;
  }
}