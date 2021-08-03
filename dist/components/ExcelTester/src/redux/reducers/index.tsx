import { combineReducers } from "redux";
import excelFilesReducer from "./excelFilesReducer";
import officeAddinServiceActionsReducer from "./officeAddinServceActionsReducer"

export default combineReducers({ excelFilesReducer, officeAddinServiceActionsReducer});