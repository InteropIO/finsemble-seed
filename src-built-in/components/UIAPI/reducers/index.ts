import { combineReducers } from "redux-loop";
import linker from "./linker";
import workspaces from './workspaces';
const rootReducer = combineReducers({
    linker,
    workspaces
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;