/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import React from "react";
import ReactDOM from "react-dom";
import "../../../../assets/css/finsemble.css";
import { FinsembleDialog, FinsembleDialogQuestion, FinsembleDialogButton } from "@chartiq/finsemble-react-controls";
import Timer from "./timer";
const DEFAULT_TITLE = ""
const DEFAULT_COMPONENT_STATE = {
	title: DEFAULT_TITLE,
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
		this.sendExpiredResponse = this.sendExpiredResponse.bind(this);
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
			title: typeof data.title === "undefined" ? DEFAULT_TITLE : data.title,
			hideModalOnClose: typeof data.hideModalOnClose === "undefined" ? true : data.hideModalOnClose,
			question: data.question,
			negativeResponseLabel: data.negativeResponseLabel || "No",
			affirmativeResponseLabel: data.affirmativeResponseLabel || "Yes",
			cancelResponseLabel: data.cancelResponseLabel || "Cancel",
			showNegativeButton: typeof data.showNegativeButton === "undefined" ? true : data.showNegativeButton,
			showAffirmativeButton: typeof data.showAffirmativeButton === "undefined" ? true : data.showAffirmativeButton,
			showCancelButton: typeof data.showCancelButton === "undefined" ? true : data.showCancelButton,
			showTimer: typeof data.showTimer === "undefined" ? false : data.showTimer,
			timerDuration: typeof data.timerDuration === "undefined" ? null : data.timerDuration
		}, this.fitAndShow);
	}

	/**
	 * Fits the contents of the DOM to the window, then calls `showDialog`, which positions the dialog on the proper monitor and toggles the visibility of the window.
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
		//This will detach the timer component from the dom. Next time the component comes up, it'll have a fresh timer.
		this.setState({
			showTimer: false
		})
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

	/**
	 * Sends an expired response to the opener.
	 *
	 * @memberof YesNoDialog
	 */
	sendExpiredResponse() {
		this.sendResponse("expired");
	}

	render() {
		var self = this;
		return (<FinsembleDialog
			userInputTimeout={10000}
			behaviorOnResponse="hide"
			onShowRequested={this.onShowRequested}
			isModal={true}>
			<div className="dialog-title">{this.state.title}</div>
			<FinsembleDialogQuestion>
				{this.state.question}
				{this.state.showTimer &&
					<Timer ontimerDurationExpiration={this.sendExpiredResponse} timerDuration={this.state.timerDuration}/>}
			</FinsembleDialogQuestion>
			<div className="button-wrapper">
			<FinsembleDialogButton show={this.state.showNegativeButton} className="fsbl-button-neutral" onClick={this.sendNegativeResponse}>
				{this.state.negativeResponseLabel}
			</FinsembleDialogButton>

			<FinsembleDialogButton show={this.state.showCancelButton} className="fsbl-button-neutral" onClick={this.sendCancelResponse}>
				{this.state.cancelResponseLabel}
			</FinsembleDialogButton>

			<FinsembleDialogButton show={this.state.showAffirmativeButton} className="fsbl-button-affirmative" onClick={this.sendAffirmativeResponse}>
				{this.state.affirmativeResponseLabel}
			</FinsembleDialogButton>
			</div>
		</FinsembleDialog>);


	}
}

window.yesNoDone = false;
//render component when FSBL is ready.
if (window.FSBL && FSBL.addEventListener) { FSBL.addEventListener("onReady", FSBLReady); } else { window.addEventListener("FSBLReady", FSBLReady) }
function FSBLReady() {
	if (!window.yesNoDone) {
		window.yesNoDone = true;
		ReactDOM.render(
			<YesNoDialog />
			, document.getElementById("YesNoDialog-component-wrapper")
		);
	}

}