import React from "react";
import { findDOMNode } from "react-dom";
import { Menu } from "@finsemble/finsemble-ui/react/components/menu";

// The menu instance;
let sampleMenuInstance: SampleMenu;

class Closer extends React.Component {
	render() {
		return (
			<div
				id="remove-menu"
				onClick={() => {
					findDOMNode(sampleMenuInstance)?.remove();
				}}
			>
				Click to remove menu
			</div>
		);
	}
}

export class SampleMenu extends React.Component {
	constructor(props: any) {
		super(props);
		sampleMenuInstance = this;
	}

	render() {
		return (
			<Menu id="sampleMenu" title="Menu to close">
				<Closer />
			</Menu>
		);
	}
}
