import React from  'react'
import FoldersList from  './FoldersList'
import LeftNavBottomLinks from  './LeftNavBottomLinks'

const bottomEntries = [
	'New folder',
	'New dashboard',
	'App catalog'
]

export default class LeftNav extends React.Component {

	constructor(props) {
		super(props)
	}
	renderFoldersList() {
		return (
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
			  )
	}
	render() {
		return (
			<div className="complex-menu-left-nav">
			  {this.renderFoldersList()}
			  <LeftNavBottomLinks />
			 </div>

		)
	}
}