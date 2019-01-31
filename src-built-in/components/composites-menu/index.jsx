import React from 'react'
import ReactDOM from 'react-dom'
import storeActions from '../composites-shared/store-actions'

import App from './App'

FSBL.addEventListener("onReady", () => {
	storeActions.prepareStore(() => {
		ReactDOM.render(<App />, document.getElementById('app'))
	})
	
})