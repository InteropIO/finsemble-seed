import "../style.css";
import "../../../../assets/css/font-finance.css";
import "../../../../assets/css/finsemble.css";
// Import js modules
import React from "react";
import ReactDOM from "react-dom";
import { createStore, getStore } from "./stores/LauncherStore";
import storeActions from "./stores/StoreActions";

// Import React components
import LeftNav from "./components/LeftNav";
import Content from "./components/Content";
import { FinsembleMenu } from "@chartiq/finsemble-react-controls";
import AddNewAppForm from "./components/AddNewAppForm";

class AppLauncher extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			isFormVisible: storeActions.getFormStatus()
		};
		this.toggleAddNewAppForm = this.toggleAddNewAppForm.bind(this);
		this.openAppMarket = this.openAppMarket.bind(this);
	}

	componentWillMount() {
		getStore().addListener({ field: "isFormVisible" }, this.toggleAddNewAppForm);
		finsembleWindow.addEventListener("shown", () => {
			finsembleWindow.focus();
		});
	}

	componentWillUnmount() {
		getStore().removeListener({ field: "isFormVisible" }, this.toggleAddNewAppForm);
	}
	/**
	 * Sets isFormVisible to true or false in state
	 * isFormVisible is used to conditionally show/hide the
	 * add new component form.
	 * @param {objec} error
	 * @param {object} data
	 */
	toggleAddNewAppForm(error, data) {
		this.setState({
			isFormVisible: data.value
		});
	}

	/**
	 * Sets isFormVisible to false in store to remove the form
	 */
	onAddNewAppFormAction() {
		getStore().setValue({
			field: "isFormVisible",
			value: false
		}, (error, data) => {
			error && console.log("Failed to set isFormVisible to false");
		});
	}

	openAppMarket() {
		FSBL.Clients.LauncherClient.showWindow(
			{
				componentType: "Advanced App Catalog"
			},
			{
				monitor: "mine",
				staggerPixels: 0,
				spawnIfNotFound: true,
				left: "center",
				top: "center"
			}
		);
	}

	render() {
		return (
			<FinsembleMenu className="app-launcher-menu">
				<div className="app-launcher">
					<div className="complex-menu-wrapper">
						<LeftNav openAppMarket={this.openAppMarket} />
						<Content />
						{this.state.isFormVisible &&
							<AddNewAppForm onDone={this.onAddNewAppFormAction} />
						}
					</div>
				</div>
			</FinsembleMenu>
		);
	}
}

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", FSBLReady);
} else {
	window.addEventListener("FSBLReady", FSBLReady);
}

function FSBLReady() {
	createStore((store) => {
		storeActions.initialize(() => {
			ReactDOM.render(<AppLauncher />,
				document.getElementById("wrapper"));
		});
	});
}
