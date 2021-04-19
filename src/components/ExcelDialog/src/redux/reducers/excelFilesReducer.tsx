import ExcelFile from '../../../../../services/OfficeAddin/types/ExcelFile';
import * as CONSTANTS from '../actions/actionTypes';
import { ExcelFileListActionType } from '../actions/actionTypes'

const initialState = {
  activeExcelFiles: Array<ExcelFile>(),
  selectedActiveExcelFile: null,
  previousExcelFiles: Array<ExcelFile>(),
  selectedPreviousFiles: Array<ExcelFile>(),
  getExcelCellDataModalDisplay: "none",
  excelCellData: {},
  sheetChangeEvent: {},
  worksheetList: [],
  selectedWorksheet: null,
  openWorkSheet: null,
  selectedClipboardData: [['A1', 'B1', 'C1'], ['A2', 'B2', 'C2'], ['A3', 'B3', 'C3']],
  range: 'A1:C3',
  selectedBookmark: {}
}

export default (state = initialState, action: ExcelFileListActionType) => {
  switch (action.type) {
    case CONSTANTS.SET_SELECTED_CLIPBOARD_DATA:
      return {
        ...state,
        selectedClipboardData: action.payload.selectedClipboardData
      }
    case CONSTANTS.GET_ACTIVE_EXCEL_FILES:
      return {
        ...state,
        activeExcelFiles: action.payload.activeExcelFiles
      };
    case CONSTANTS.SET_SELECTED_ACTIVE_EXCEL_FILES:
      return {
        ...state,
        selectedActiveExcelFile: action.payload.selectedActiveExcelFile
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
      return {
        ...state,
        sheetChangeEvent: action.payload.sheetChangeEvent
      }
    case CONSTANTS.GET_WORKSHEET_LIST:
      return {
        ...state,
        worksheetList: action.payload.worksheetList
      }
    case CONSTANTS.SET_SELECTED_WORKSHEET:
      return {
        ...state,
        selectedWorksheet: action.payload.selectedWorksheet
      };
    case CONSTANTS.SET_OPEN_WORKSHEET:
      return {
        ...state,
        openWorksheet: action.payload.openWorksheet
      };
    case CONSTANTS.SET_RANGE:
      return {
        ...state,
        range: action.payload.range
      };
    case CONSTANTS.SET_SELECTED_BOOKMARK:
      return {
        ...state,
        selectedBookmark: action.payload.selectedBookmark
      }
    default:
      return state;
  }
}