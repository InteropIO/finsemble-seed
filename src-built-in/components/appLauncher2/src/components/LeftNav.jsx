import React from  'react'
import FoldersList from  './FoldersList'
import LeftNavBottomLinks from  './LeftNavBottomLinks'
import {getStore} from '../stores/LauncherStore'

const bottomEntries = [
	'New folder',
	'New dashboard',
	'App catalog'
]

export default class LeftNav extends React.Component {

	constructor(props) {
		super(props)
	}
	
	render() {
		return (
			<div className="complex-menu-left-nav">
			  <FoldersList />
			  <LeftNavBottomLinks />
			 </div>

		)
	}
}