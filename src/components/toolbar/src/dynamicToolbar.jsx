/*!
* Copyright 2017 by ChartIQ, Inc.
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
import BringToFront from "../components/BringToFront";
import WorkspaceLauncherButton from "../components/WorkspaceLauncherButton";

// Support Dynamically Loading External Components
var customComponents = [];
customComponents["AutoArrange"] = AutoArrange;
customComponents["BringToFront"] = BringToFront;

// Styles
import "../../assets/css/finsemble.scss";
import "../../assets/css/finfont.css";
import "../toolbar.scss";

var pinnableItems = {
	"componentLauncher": FinsembleButton,
	"workspaceSwitcher": WorkspaceLauncherButton
};

export default class Toolbar extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			sections: ToolbarStore.getSectionsFromMenus(),
			finWindow: fin.desktop.Window.getCurrent()
		};
		this.bindCorrectContext();
	}

	bindCorrectContext() {
		this.onSectionsUpdate = this.onSectionsUpdate.bind(this);
	}


	// called when sections change in the toolbar store
	onSectionsUpdate(err, response) {
		this.setState({ sections: response.value });
	}

	componentDidMount() {
		this.state.finWindow.bringToFront();
	}

	componentWillMount() {
		ToolbarStore.Store.addListener({ field: "sections" }, this.onSectionsUpdate);
	}

	componentWillUnmount() {
		ToolbarStore.Store.removeListener({ field: "sections" }, this.onSectionsUpdate);
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
					buttonComponent = <FinsembleButton iconClasses="pinned-icon" buttonType={["AppLauncher", "Toolbar"]} key={i} {...button}></FinsembleButton>;
					break;
				case "menuLauncher":
						buttonComponent = <FinsembleButton preSpawn={true} buttonType={["MenuLauncher", "Toolbar"]} key={i} {...button}></FinsembleButton>;
					break;
				}
				buttons.push(buttonComponent);

			}

			// Add separators to the end for left and the begining for right sections:
			if (sectionPosition == "right") {
				buttons.splice(0, 0, <FinsembleToolbarSeparator key={sectionPosition} />);
			} else if (sectionPosition == "left") {
				buttons.push(<FinsembleToolbarSeparator key={sectionPosition} />);
			}

			var sectionComponent = (<FinsembleToolbarSection name={sectionPosition} pinnableItems={pinnableItems} className={sectionPosition} key={sectionPosition} handleOverflow={sectionPosition === "center"} handlePins={sectionPosition === "center"} >
				{buttons}
			</FinsembleToolbarSection>);
			sections.push(sectionComponent);
		}
		return sections;
	}

	render() {
		console.log("Toolbar Render ");
		if (!this.state.sections) return;
		return (<FinsembleToolbar>
			{this.getSections()}
		</FinsembleToolbar>);
	}

}
FSBL.addEventListener("onReady", function () {
	ToolbarStore.initialize(function () {
		ReactDOM.render(
			<Toolbar />
			, document.getElementById("toolbar_parent"));
	});
});

