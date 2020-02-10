import { combineReducers } from "redux";
import { linker } from "./linker";
import workspaces from './workspaces';
const rootReducer = combineReducers({
    linker,
    workspaces
});

export default rootReducer;
