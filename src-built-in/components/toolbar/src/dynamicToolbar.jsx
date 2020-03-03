/*!
* Copyright 2017 - 2020 by ChartIQ, Inc.
* All rights reserved.
*/
import React from "react";
import ReactDOM from "react-dom";
// Toolbar Components
import { FinsembleToolbar, FinsembleButton, FinsembleToolbarSection, FinsembleToolbarSeparator } from "@chartiq/finsemble-react-controls";

// Store
import ToolbarStore from "../stores/toolbarStore";

// External Components to show on Toolbar
import AutoArrange from "../components/AutoArrange";
import AlwaysOnTop from "../components/AlwaysOnTop";
import BringToFront from "../components/BringToFront";
import MinimizeAll from "../components/MinimizeAll";
import WorkspaceLauncherButton from "../components/WorkspaceLauncherButton";
import WorkspaceMenuOpener from "../components/WorkspaceMenuOpener"
import Search from "../components/Search"
import DragHandle from "../components/DragHandle"

// Support Dynamically Loading External Components
var customComponents = [];
customComponents["AutoArrange"] = AutoArrange;
customComponents["AlwaysOnTop"] = AlwaysOnTop;
customComponents["BringToFront"] = BringToFront;
customComponents["MinimizeAll"] = MinimizeAll;
customComponents["WorkspaceMenuOpener"] = WorkspaceMenuOpener;
customComponents["Search"] = Search;

// Styles
import "../toolbar.css";
import "../../../../assets/css/font-finance.css";
import "../../../../assets/css/finsemble.css";

var pinnableItems = {
	"componentLauncher": FinsembleButton,
	"workspaceSwitcher": WorkspaceLauncherButton
};

export default class Toolbar extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			sections: ToolbarStore.getSectionsFromMenus(),
		};
		this.bindCorrectContext();
	}

	bindCorrectContext() {
		this.onSectionsUpdate = this.onSectionsUpdate.bind(this);
		this.onPinDrag = this.onPinDrag.bind(this);
	}

	// called when sections change in the toolbar store
	onSectionsUpdate(err, response) {
		this.setState({ sections: response.value });
	}

	componentDidMount() {
		finsembleWindow.bringToFront();
	}

	componentWillMount() {
		var self = this;
		ToolbarStore.setupPinnedHotKeys(function (err, data) {
			let pin = self.refs.pinSection.element.childNodes[data - 1];
			//Goes and finds the toolbar button and clicks it.
			if (pin.childNodes[0] && pin.childNodes[0].children[0]) {
				pin.childNodes[0].children[0].click();
			}
		});
		ToolbarStore.Store.addListener({ field: "sections" }, this.onSectionsUpdate);
	}

	componentWillUnmount() {
		ToolbarStore.Store.removeListener({ field: "sections" }, this.onSectionsUpdate);
	}

	onPinDrag(changeEvent) {

		let pins = this.refs.pinSection.state.pins;
		let newPins = JSON.parse(JSON.stringify(pins));
		let { destination, source } = changeEvent;
		//user dropped without reordering.
		if (!destination) return;
		let target = pins[source.index];
		newPins.splice(source.index, 1);
		newPins.splice(destination.index, 0, target);
		function pinsToObj(arr) {
			let obj = {};
			arr.forEach((el, i) => {
				if (el) {
					let key = el.label;
					obj[key] = el;
					obj[key].index = i;
				}
			});
			return obj;
		}
		this.refs.pinSection.setState({ pins: newPins });
		ToolbarStore.GlobalStore.setValue({ field: 'pins', value: pinsToObj(newPins) });
	}

	/**
	 * This a sample dynamic toolbar which builds a toolbar from config, dynamically updates and can render any react component as a toolbar item.
	 * The "sections" are built by the toolbar store. getSections() takes the sections object and builds right/left/center sections using the FinsembleToolbarSection control.
	 *
	 *
	 * @returns rendered toolbar
	 * @memberof Toolbar
	 */
	getSections() {
		var sections = [];
		for (var sectionPosition in this.state.sections) {
			var section = this.state.sections[sectionPosition];
			var buttons = [];
			for (var i = 0; i < section.length; i++) {
				var button = section[i];
				if (!button.type) button.type = "menuLauncher";
				var buttonComponent;
				switch (button.type) {
					case "seperator":
						buttonComponent = <FinsembleToolbarSeparator key={i} />;
						break;
					case "reactComponent":
						let Component = customComponents[button.reactComponent];
						buttonComponent = <Component key={i} {...button} className={"finsemble-toolbar-button"} />;
						break;
					case "workspaceSwitcher":
						buttonComponent = <WorkspaceLauncherButton key={i} {...button}></WorkspaceLauncherButton>;
						break;
					case "componentLauncher":
						buttonComponent = <FinsembleButton id={button.id} iconClasses="pinned-icon" buttonType={["AppLauncher", "Toolbar"]} dockedTop={true} key={i} {...button}></FinsembleButton>;
						break;
					case "menuLauncher":
						buttonComponent = <FinsembleButton preSpawn={true} buttonType={["MenuLauncher", "Toolbar"]} dockedTop={true} key={i} {...button}></FinsembleButton>;
						break;
				}
				buttons.push(buttonComponent);
			}

			// Add separators to the end for left and the begining for right sections:
			if (sectionPosition == "right") {
				buttons.splice(0, 0, <FinsembleToolbarSeparator key={sectionPosition} />);
			}

			var sectionComponent = (<FinsembleToolbarSection
				key={i}
				arrangeable={sectionPosition === "center"}
				ref="pinSection"
				name={sectionPosition}
				pinnableItems={pinnableItems}
				className={sectionPosition}
				key={sectionPosition}
				handleOverflow={sectionPosition === "center"}
				handlePins={sectionPosition === "center"}>
				{buttons}
			</FinsembleToolbarSection>);
			sections.push(sectionComponent);
		}
		return sections;
	}

	render() {
		if (!this.state.sections) return;
		return (<FinsembleToolbar onDragStart={this.moveToolbar} onDragEnd={this.onPinDrag}>
			<DragHandle/>
			{this.getSections()}
			<div className='resize-area' />
		</FinsembleToolbar>);
	}

}

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", FSBLReady);
} else {
	window.addEventListener("FSBLReady", FSBLReady);
}
function FSBLReady() {
	ToolbarStore.initialize(function () {
		ReactDOM.render(
			<Toolbar />
			, document.getElementById("toolbar_parent"));
	});
}
