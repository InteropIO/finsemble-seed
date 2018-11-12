import React from 'react'
import ReactDOM from 'react-dom'
import Dashboard from './Dashboard'

FSBL.addEventListener("onReady", function () {
	ReactDOM.render(<Dashboard />,
		document.getElementById('app'), () => {
			console.log('Rendered dashboard')
		})
})