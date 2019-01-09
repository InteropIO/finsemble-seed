import React from "react";
import FoldersList from "./FoldersList";
import LeftNavBottomLinks from "./LeftNavBottomLinks";
import { getStore } from "../stores/LauncherStore";
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
		if (!event.destination) return;
		//There are two items above the 0th item in the list. They aren't reorderable. We add 2 to the index so that it matches with reality. The source comes in properly but the destination needs to be offset.
		let newIndex = event.destination.index + 2;

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