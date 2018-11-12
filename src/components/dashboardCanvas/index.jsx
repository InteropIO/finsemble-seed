import React from 'react'
import ReactDOM from 'react-dom'
import Canvas from './Canvas'

FSBL.addEventListener("onReady", function () {
	ReactDOM.render(<Canvas />, document.getElementById('root'))
})
