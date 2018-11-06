import React from  'react'
import FoldersList from  './FoldersList'
import LeftNavBottomLinks from  './LeftNavBottomLinks'
import {getStore} from '../stores/LauncherStore'
import storeActions from '../stores/StoreActions'

import {
	FinsembleDnDContext,
	FinsembleDroppable
} from '@chartiq/finsemble-react-controls'


const bottomEntries = [
	'New folder',
	'New dashboard',
	'App catalog'
]

export default class LeftNav extends React.Component {

	constructor(props) {
		super(props)
	}

	onDragEnd(event) {
		console.log('on drag end');
		// storeActions.reorderFolders(
		// 	event.destination.index,
		// 	event.source.index)
		storeActions.reorderFolders(event.source.index, event.destination.index);
	}

	render() {
		return (
			<div className="complex-menu-left-nav">
				<FinsembleDnDContext onDragEnd={this.onDragEnd}>
					<FinsembleDroppable direction="vertical" droppableId="folderList">
				  		<FoldersList />
				  	</FinsembleDroppable>
				</FinsembleDnDContext>
				<LeftNavBottomLinks {...this.props} />
			</div>

		)
	}
}