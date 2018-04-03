/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import React from "react";
import ReactDOM from "react-dom";
import "../../assets/css/finsemble.scss";

import { FinsembleDialog, FinsembleDialogQuestion, FinsembleDialogTextInput, FinsembleDialogButton } from "@chartiq/finsemble-react-controls";
/**
 * This is our standard input dialog. It gives the user a single button and a text field, and ferries that data back to the window that opened it.
 *
 * @class SingleInputDialog
 * @extends {React.Component}
 */
class SingleInputDialog extends React.Component {
	constructor() {
		super();
		this.bindCorrectContext();
		this.state = {
			inputLabel: "No question.",
			affirmativeResponseLabel: "Yes"
		};
		document.body.addEventListener("keydown", this.handleKeydownOnBody);
	}

	bindCorrectContext() {
		this.handleKeydownOnBody = this.handleKeydownOnBody.bind(this);
		this.onShowRequested = this.onShowRequested.bind(this);
		this.setInputValue = this.setInputValue.bind(this);
		this.sendResponse = this.sendResponse.bind(this);
	}
	/**
	 * Handles escape and enter.
	 *
	 * @param {any} e
	 * @memberof SingleInputDialog
	 */
	handleKeydownOnBody(e) {
		if (e.code === "Enter" && e.shiftKey === false) {
			this.sendResponse("affirmative");
		}

		if (e.code === "Escape") {
			this.sendResponse("cancel");
		}
	}
	/**
	 * When the opener requests that the dialog show itself, it also passes in initialization data. This function grabs that data, calls setState, and then fits the window to the contents of the DOM. Then we call `showDialog`, which will display the dialog on the proper monitor.
	 *
	 * @param {any} err
	 * @param {any} response
	 * @memberof SingleInputDialog
	 */
	onShowRequested(err, response) {
		let data = response.data;
		this.setState({
			inputValue: null,
			hideModalOnClose: typeof data.hideModalOnClose === "undefined" ? true : data.hideModalOnClose,
			inputLabel: data.inputLabel,
			affirmativeResponseLabel: data.affirmativeResponseLabel || "Okay",
			cancelResponseLabel: data.affirmativeResponseLabel || "Cancel",
			showCancelButton: typeof data.showCancelButton === "undefined" ? false : data.showCancelButton
		}, this.fitAndShow);
	}
	/**
	 * Fits the contents of the DOM to the openfin window, then calls `showDialog`, which positions the dialog on the proper monitor and toggles the visiblity of the window.
	 *
	 * @memberof SingleInputDialog
	 */
	fitAndShow() {
		FSBL.Clients.WindowClient.fitToDOM(null, function () {
			FSBL.Clients.DialogManager.showDialog();
		});
	}
	/**
	 * Sends user input to the opener.
	 *
	 * @param {any} response
	 * @memberof SingleInputDialog
	 */
	sendResponse(response) {
		FSBL.Clients.DialogManager.respondToOpener({
			value: this.state.inputValue,
			choice: response,
			hideModalOnClose: this.state.hideModalOnClose
		});

		this.setState({
			inputValue: null
		});
		Array.from(document.querySelectorAll("input")).forEach((el) => el.value = "");
	}
	/**
	 * onChange handler. When the user types, we keep the value up to date in the dialog's state.
	 *
	 * @param {any} e
	 * @memberof SingleInputDialog
	 */
	setInputValue(e) {
		this.setState({
			inputValue: e.target.value
		});
	}

	render() {
		var self = this;
		return (<FinsembleDialog
			userInputTimeout={10000}
			behaviorOnResponse="hide"
			onShowRequested={this.onShowRequested}
			isModal={true}>
			<FinsembleDialogQuestion question={this.state.inputLabel} />
			<FinsembleDialogTextInput maxLength="40" onInputChange={this.setInputValue} />
			<FinsembleDialogButton buttonSize="md" onClick={() => { this.sendResponse("affirmative"); }}>
				{this.state.affirmativeResponseLabel}
			</FinsembleDialogButton>
			{
				this.state.showCancelButton &&
				<FinsembleDialogButton buttonSize="md" onClick={() => {
					this.sendResponse("cancel");
				}}>
					{this.state.cancelResponseLabel}
				</FinsembleDialogButton>
			}
		</FinsembleDialog>);
	}
}

//render component when FSBL is ready.
FSBL.addEventListener("onReady", function () {
	ReactDOM.render(
		<SingleInputDialog />
		, document.getElementById("singleInputDialog-component-wrapper"));
});