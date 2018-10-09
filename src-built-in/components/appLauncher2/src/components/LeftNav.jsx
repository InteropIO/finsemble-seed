import React from  'react'
import FoldersList from  './FoldersList'

export default class LeftNav extends React.Component {

	constructor(props) {
		super(props)
		this.state = {
			list: []
		}
		// bind methods
		this.onFolderClicked = this.onFolderClicked.bind(this)

	}

	onFolderClicked(folder) {
		
	}

	render() {
		return (
			<div className="complex-menu-left-nav">
			  <h1>LeftNav Component </h1>
			  <div className="top">
				  <button>My apps</button>
				  <button>Favorutes</button>
				  <button>Dashboards</button>
			  </div>
			  <FoldersList onFolderClicked={this.onFolderClicked} list={this.state.list} />
			  <div className="bottom">
				  <button>New folder</button>
				  <button>New dashboard</button>
				  <button>App Catalogue</button>
			  </div>
			 </div>

		)
	}
}