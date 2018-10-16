/*!
* The adhoc component is a form that will create ta new adhoc component that the user can spawn from the app launcher.
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/

import React from "react";
import ReactDOM from "react-dom";
//Finsemble font-icons, general styling, and specific styling.
import "./adhoc.css";
import "../../../assets/css/finsemble.css";
import { FinsembleDialog, FinsembleDialogTextInput, FinsembleDialogQuestion, FinsembleDialogButton } from "@chartiq/finsemble-react-controls";

class AdHocComponentForm extends React.Component {
	constructor(props) {
		super(props);
		this.save = this.save.bind(this);
		this.cancel = this.cancel.bind(this);
		this.setName = this.setName.bind(this);
		this.setURL = this.setURL.bind(this);
	}
	/**
	 * Adds eventListeners on keydown, sets the height of the component.
	 *
	 * @memberof AdHoc
	 */
	componentDidMount() {
		FSBL.Clients.WindowClient.fitToDOM();
		var self = this;
		var onkeydown = function (e) {
			if (e.code === "Enter" && e.shiftKey === false) {
				self.save();
			}

			if (e.code === "Escape") {
				self.cancel();
			}
		};

		document.body.addEventListener("keydown", onkeydown);
	}
	/**
	 * Hides the window when the save button is clicked.
	 *
	 * @memberof AdHoc
	 */
	hideWindow() {
		fin.desktop.Window.getCurrent().hide();
	}
	/**
	 * Persists the adHoc component to storage.
	 * @todo On error, display error message and allow user to try again.
	 * @memberof AdHoc
	 */
	save() {
		if (!this.state) return FSBL.Clients.DialogManager.respondToOpener({});
		let name = this.state.name;
		let url = this.state.url;
		if (!name || !url) return FSBL.Clients.DialogManager.respondToOpener({});
		let validUrl;
		//Checks to see if what the user has passed in is a genuine URL. This is so that stuff like 'about:blank' is accepted, but wigglesWorth-4343,com is not.
		try {
			validUrl = new URL(url);
		} catch (e) {
			try {
				validUrl = new URL("http://" + url);
			} catch (e) {
				console.error("Invalid URL");
				return FSBL.Clients.DialogManager.respondToOpener({
					error: "Invalid URL"
				});
			}
		}
		url = validUrl.href;
		FSBL.Clients.LauncherClient.addUserDefinedComponent({
			name: name,
			url: url
		}, function (err, response) {
			if (err) {
				console.error(err);
			}
			//FSBL.Clients.WindowClient.close(false);
			FSBL.Clients.DialogManager.respondToOpener({});
		});
		Array.from(document.querySelectorAll("input")).forEach((el) => el.value = "");
		this.setState({
			name: "",
			url: ""
		});
	}
	/**
	 * Kills the window.
	 * @todo make this component show/hide instead of spawn/close.
	 * @memberof AdHoc
	 */
	cancel() {
		this.setState({
			name: "",
			url: ""
		});
		//FSBL.Clients.WindowClient.close(false);
		FSBL.Clients.DialogManager.respondToOpener({});

	}

	setName(e) {
		this.setState({ name: e.target.value });
	}

	setURL(e) {
		this.setState({ url: e.target.value });
	}

	render() {
		var self = this;
		return (<FinsembleDialog
			behaviorOnResponse="hide"
			onShowRequested={() => {
				FSBL.Clients.WindowClient.fitToDOM(null, function () {
					FSBL.Clients.DialogManager.showDialog();
				});
			}}
			isModal={true}>
			<div className="dialog-title">Enter a name and URL for your app.</div>
			<FinsembleDialogTextInput onInputChange={this.setName} placeholder="Name" autofocus value={this.name} />
			<FinsembleDialogTextInput onInputChange={this.setURL} placeholder="URL" value={this.URL} />
			<div className="button-wrapper">

				<FinsembleDialogButton show={true} className="fsbl-button-neutral" onClick={this.cancel}>
					Cancel
				</FinsembleDialogButton>

				<FinsembleDialogButton show={true} className="fsbl-button-affirmative" onClick={this.save}>
					Confirm
				</FinsembleDialogButton>
			</div>
		</FinsembleDialog>




		);
	}
}


if (window.FSBL && FSBL.addEventListener) { FSBL.addEventListener("onReady", FSBLReady); } else { window.addEventListener("FSBLReady", FSBLReady) }
function FSBLReady() {
	console.debug("AdhocComponentForm onready");
	ReactDOM.render(
		<AdHocComponentForm />
		, document.getElementById("bodyHere"));
}
