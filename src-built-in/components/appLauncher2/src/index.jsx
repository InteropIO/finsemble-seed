import "../style.css"
import "../../../../assets/css/font-finance.css"
import "../../../../assets/css/finsemble.css"
// Import js modules
import React from  'react'
import ReactDOM from  'react-dom'
import {createStore, getStore} from './stores/LauncherStore'
// Import React components
import LeftNav from './components/LeftNav'
import Content from './components/Content'

class AppLauncher extends React.Component {

	constructor() {
		super()
	}

	render() {
		return (
			<div className="user-preferences">
				<div className="complex-menu-wrapper">
					<LeftNav />
					<Content />
				</div>
			</div>
		)
	}
}


FSBL.addEventListener("onReady", function () {
	createStore((store) => {
		ReactDOM.render(
			<AppLauncher />
		, document.getElementById("wrapper"))
		})
});