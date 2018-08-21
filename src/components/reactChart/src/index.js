import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { applyMiddleware, createStore } from 'redux'
import thunk from 'redux-thunk'
import { logger } from 'redux-logger'
import 'babel-polyfill'
import './finsemble-functionality'

import reducer from './reducers'
import ChartContainer from './containers/chartContainer'


// redux-thunk middleware for logging and complex actions
const middlewares = [thunk];

// add logging for dev environment to output all actions and state changes
if(process.env.NODE_ENV === 'development'){
  middlewares.push(logger);
}

// declare redux store with thunk
let store = createStore(
  reducer,
  applyMiddleware(...middlewares)
);

// main react container
let chartEl = document.getElementById('chartHere');

// main application rendering entry point
render(
  <Provider store={store}>
    <ChartContainer />
  </Provider>
  , chartEl
)
