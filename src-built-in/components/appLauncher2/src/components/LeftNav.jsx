import React from  'react'
import FoldersList from  './FoldersList'

const bottomEntries = [
	'New folder',
	'New dashboard',
	'App catalogue'
]

export default class LeftNav extends React.Component {

	constructor(props) {
		super(props)
	}

	render() {
		return (
			<div className="complex-menu-left-nav">
			  <div className="top">
				  {
				  	this.props.folders.map((folder, index) => {
				  		let className = 'complex-menu-section-toggle'
				  		return (
				  			<div onClick={() => this.props.onFolderClicked(folder)} 
				  			className={className} key={index}>
				  				{folder.name}
				  			</div>
				  			)
				  	})
				  }
			  </div>
			  <div className="bottom">
				  {
				  	bottomEntries.map((entry, index) => {
				  		let className = 'complex-menu-section-toggle'
				  		return (
				  			<div className={className} key={index}>
				  				{entry}
				  			</div>
				  			)
				  	})
				  }
			  </div>
			 </div>

		)
	}
}