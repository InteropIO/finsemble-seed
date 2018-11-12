import React from 'react'
import ReactDOM from 'react-dom'
import Drag from './Drag'

FSBL.addEventListener("onReady", function () {
	ReactDOM.render(<Drag />, document.getElementById('root'))
})
