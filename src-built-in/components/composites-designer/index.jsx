import React from 'react'
import ReactDOM from 'react-dom'
import App from './components/App'
import {createStore} from './store'

FSBL.addEventListener("onReady", () => {
	// Create distributed store
	createStore(() => {
		// Once ready, render React component
		ReactDOM.render(<App />, document.getElementById('app'))
	})
})