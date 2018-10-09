import "../style.css"
import "../../../../assets/css/font-finance.css"
import "../../../../assets/css/finsemble.css"
// Import js modules
import React from  'react'
import ReactDOM from  'react-dom'
// Import React components
import LeftNav from './components/LeftNav'
import Content from './components/Content'

const appFolders = require('./folders').appFolders

class AppLauncher extends React.Component {

	constructor() {
		super()
		this.state = {
			folders: appFolders.folders,
			activeFolder: appFolders.folders[0]
		}

		this.onFolderClicked = this.onFolderClicked.bind(this)
	}

	onFolderClicked(folder) {
		this.setState({
			activeFolder: folder
		})
	}

	render() {
		return (
			<div className="user-preferences">
				<div className="complex-menu-wrapper">
					<LeftNav onFolderClicked={this.onFolderClicked} folders={this.state.folders} />
					<Content activeFolder={this.state.activeFolder} />
				</div>
			</div>
		)
	}
}


FSBL.addEventListener("onReady", function () {
	ReactDOM.render(
	<AppLauncher />
	, document.getElementById("wrapper"))
});