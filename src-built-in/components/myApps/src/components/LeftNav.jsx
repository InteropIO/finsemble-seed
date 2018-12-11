import React from  "react";
import FoldersList from  "./FoldersList";
import LeftNavBottomLinks from  "./LeftNavBottomLinks";
import {getStore} from "../stores/LauncherStore";
import storeActions from "../stores/StoreActions";

import {
	FinsembleDnDContext,
	FinsembleDroppable
} from "@chartiq/finsemble-react-controls";


const bottomEntries = [
	"New folder",
	//'New dashboard',
	"App catalog"
];

export default class LeftNav extends React.Component {

	constructor(props) {
		super(props);
	}

	onDragEnd(event = {}) {
		console.log("on drag end");
		// storeActions.reorderFolders(
		// 	event.destination.index,
		// 	event.source.index)

		// Don't allow the destination to be my apps or favorites
		// This is a quick and easy and clean way, avoiding big change
		// for now
		let newIndex = event.destination.index;
		if(event.destination && newIndex <= 1) {
			newIndex = 2;
		}

		storeActions.reorderFolders(event.source.index, newIndex);

	}

	render() {
		return (
			<div className="complex-menu-left-nav">
				<FinsembleDnDContext onDragStart={this.onDragStart} onDragEnd={this.onDragEnd}>
					<FinsembleDroppable direction="vertical" droppableId="folderList">
				  		<FoldersList />
				  	</FinsembleDroppable>
				</FinsembleDnDContext>
				<LeftNavBottomLinks {...this.props} />
			</div>

		);
	}
}