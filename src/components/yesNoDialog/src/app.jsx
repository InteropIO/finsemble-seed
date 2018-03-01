/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import React from "react";
import ReactDOM from "react-dom";
import "../../assets/css/finsemble.scss";
import { FinsembleDialog, FinsembleDialogQuestion, FinsembleDialogButton } from "@chartiq/finsemble-react-controls";

const DEFAULT_COMPONENT_STATE = {
	question: "No question.",
	negativeResponseLabel: "No",
	affirmativeResponseLabel: "Yes",
	cancelResponseLabel: "Cancel",
	showNegativeButton: true,
	showAffirmativeButton: true,
	showCancelButton: true
};
/**
 * This is our standard dialog that presents the user with 1 - 3 choices. It can be used to allow the user to confirm, reject, or cancel an action. All of these options can be included, and all can be excluded.
 *
 * @class YesNoDialog
 * @extends {React.Component}
 */
class YesNoDialog extends React.Component {
	constructor() {
		super();
		this.bindCorrectContext();
		this.state = DEFAULT_COMPONENT_STATE;
		document.body.addEventListener("keydown", this.handleKeydownOnBody);
	}
	/**
	 * Handles escape and enter.
	 *
	 * @param {any} e
	 * @memberof YesNoDialog
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
	 * Necessary to ensure that `this` is correct when our methods are invoked.
	 *
	 * @memberof YesNoDialog
	 */
	bindCorrectContext() {
		this.handleKeydownOnBody = this.handleKeydownOnBody.bind(this);
		this.onShowRequested = this.onShowRequested.bind(this);
		this.sendAffirmativeResponse = this.sendAffirmativeResponse.bind(this);
		this.sendCancelResponse = this.sendCancelResponse.bind(this);
		this.sendNegativeResponse = this.sendNegativeResponse.bind(this);
		this.sendResponse = this.sendResponse.bind(this);
	}
	/**
	 * When the opener requests that the dialog show itself, it also passes in initialization data. This function grabs that data, calls setState, and then fits the window to the contents of the DOM. Then we call `showDialog`, which will display the dialog on the proper monitor.
	 *
	 * @param {any} err
	 * @param {any} response
	 * @memberof YesNoDialog
	 */
	onShowRequested(err, response) {
		let data = response.data;
		this.setState({
			hideModalOnClose: typeof data.hideModalOnClose === "undefined" ? true : data.hideModalOnClose,
			question: data.question,
			negativeResponseLabel: data.negativeResponseLabel || "No",
			affirmativeResponseLabel: data.affirmativeResponseLabel || "Yes",
			cancelResponseLabel: data.cancelResponseLabel || "Cancel",
			showNegativeButton: typeof data.showNegativeButton === "undefined" ? true : data.showNegativeButton,
			showAffirmativeButton: typeof data.showAffirmativeButton === "undefined" ? true : data.showAffirmativeButton,
			showCancelButton: typeof data.showCancelButton === "undefined" ? true : data.showCancelButton,
		}, this.fitAndShow);
	}

	/**
	 * Fits the contents of the DOM to the openfin window, then calls `showDialog`, which positions the dialog on the proper monitor and toggles the visiblity of the window.
	 *
	 * @memberof YesNoDialog
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
	 * @memberof YesNoDialog
	 */
	sendResponse(response) {
		FSBL.Clients.DialogManager.respondToOpener({
			choice: response,
			hideModalOnClose: this.state.hideModalOnClose
		});
	}
	/**
	 * Sends an affirmative response to the opener.
	 *
	 * @memberof YesNoDialog
	 */
	sendAffirmativeResponse() {
		this.sendResponse("affirmative");
	}
	/**
	 * Sends a negative response to the opener.
	 *
	 * @memberof YesNoDialog
	 */
	sendNegativeResponse() {
		this.sendResponse("negative");
	}
	/**
	 * Sends a cancel response to the opener.
	 *
	 * @memberof YesNoDialog
	 */
	sendCancelResponse() {
		this.sendResponse("cancel");
	}

	render() {
		var self = this;
		return (<FinsembleDialog
			userInputTimeout={10000}
			behaviorOnResponse="hide"
			onShowRequested={this.onShowRequested}
			isModal={true}>
			<FinsembleDialogQuestion>
				{this.state.question}
			</FinsembleDialogQuestion>

			<FinsembleDialogButton show={this.state.showAffirmativeButton} buttonSize="md" onClick={this.sendAffirmativeResponse}>
				{this.state.affirmativeResponseLabel}
			</FinsembleDialogButton>

			<FinsembleDialogButton show={this.state.showNegativeButton} buttonSize="md" onClick={this.sendNegativeResponse}>
				{this.state.negativeResponseLabel}
			</FinsembleDialogButton>

			<FinsembleDialogButton show={this.state.showCancelButton} buttonSize="md" onClick={this.sendCancelResponse}>
				{this.state.cancelResponseLabel}
			</FinsembleDialogButton>
		</FinsembleDialog>);


	}
}

//render component when FSBL is ready.
FSBL.addEventListener("onReady", function () {
	ReactDOM.render(
		<YesNoDialog />
		, document.getElementById("YesNoDialog-component-wrapper"));
});