/**
 * Reducers module combining all redux reducers
 * @module reducers/reducer
 */

import { combineReducers } from 'redux'
import chart from './chartReducer'
import draw from './drawingReducer'
import study from './studyReducer'
import theme from './themeReducer'

const reducer = combineReducers({
    chart,
    draw,
    study,
    theme
});


export default reducer
