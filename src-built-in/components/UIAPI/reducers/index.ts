import { combineReducers } from "redux-loop";
import linker from "./linker";

const rootReducer = combineReducers({ 
    linker
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;