/*!
* The adhoc component is a form that will create ta new adhoc component that the user can spawn from the app launcher.
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/

import React from "react";
import ReactDOM from "react-dom";
//Finsemble font-icons, general styling, and specific styling.
import "../assets/css/finfont.css";
import "../assets/css/finsemble.scss";
import "./adhoc.scss";

// const Test = require('./test');




class AdHocComponentForm extends React.Component {
	constructor(props) {
		super(props);
		this.save = this.save.bind(this);
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
		this.hideWindow();
		let name = this.refs.name.value;
		let url = this.refs.url.value;
		if (!name || !url) return;
		let validUrl;
		//Checks to see if what the user has passed in is a genuine URL. This is so that stuff like 'about:blank' is accepted, but wigglesWorth-4343,com is not.
		try {
			validUrl = new URL(url);
		} catch (e) {
			try {
				validUrl = new URL("http://" + url);
			} catch (e) {
				console.error("Invalid URL");
				return FSBL.Clients.WindowClient.close(false);
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
			FSBL.Clients.WindowClient.close(false);
		});
	}
	/**
	 * Kills the window.
	 * @todo make this component show/hide instead of spawn/close.
	 * @memberof AdHoc
	 */
	cancel() {
		FSBL.Clients.WindowClient.close(false);
	}
	render() {
		var self = this;
		return (<div id="dialog" className="dialog">
			<h3>
				Input a name and URL for your new app.
			</h3>
			{/*Name of the new component.*/}
			<div className="form-group">
				<label>Name: </label>
				<input id="Name" ref="name" autoFocus />
			</div>
			{/*URL for the new component.*/}
			<div className="form-group">
				<label>URL: </label>
				<input id="Url" ref="url" />
			</div>
			<div className="fsbl-buttonGroup">
				<div id="SaveButton"
					className="fsbl-button fsbl-button-md" onClick={this.save}><i className="ff-check-circle"></i>Save</div>
				<div id="CancelButton"
					className="fsbl-button fsbl-button-md" onClick={this.cancel}>Cancel</div>
			</div>
		</div>);
	}
}


FSBL.addEventListener("onReady", function () {
	console.debug("AdhocComponentForm onready");
	ReactDOM.render(
		<AdHocComponentForm />
		, document.getElementById("bodyHere"));
});