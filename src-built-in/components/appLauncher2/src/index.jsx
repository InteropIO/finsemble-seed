import React from  'react'
import ReactDOM from  'react-dom'
import LeftNav from './components/LeftNav'
import Content from './components/Content'

class AppLauncher extends React.Component {

	constructor() {
		super()
	}

	render() {
		return (
			<div>
				<LeftNav />
				<Content />
			</div>
		)
	}
}


FSBL.addEventListener("onReady", function () {
	ReactDOM.render(
	<AppLauncher />
	, document.getElementById("bodyHere"))
});