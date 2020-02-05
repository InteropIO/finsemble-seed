import { combineReducers } from "redux-loop";
import {linker, initialState as initialLinkerState } from "./linker";

export const rootReducer = combineReducers({ 
    linker
});

export const initialState = {
    linker: initialLinkerState
}

export type RootState = ReturnType<typeof rootReducer>;
