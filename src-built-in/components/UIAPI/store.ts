import { createStore } from "redux";
import {rootReducer, initialState} from "./reducers";
// import { install } from "redux-loop";

// @ts-ignore rootReducer type from redux-loop is different from the one from redux, but they are compatible
export default createStore(rootReducer, initialState);
