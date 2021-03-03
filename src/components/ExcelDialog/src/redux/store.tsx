import { createStore, applyMiddleware  } from "redux";
import rootReducer from "./reducers";
import thunkMiddleware from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension'

const composedEnhancer = composeWithDevTools(applyMiddleware(thunkMiddleware))
const store = createStore(rootReducer, composedEnhancer)

export default store
export type RootState = ReturnType<typeof rootReducer>
