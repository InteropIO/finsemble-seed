import { createStore } from "redux";
import rootReducer from "./reducers";
import { install } from "redux-loop";

export default createStore(rootReducer, undefined, install());
