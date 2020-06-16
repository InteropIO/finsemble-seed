var chai = require("chai");
var { assert } = chai;
var { should } = chai;
var { expect } = chai;
var { RouterClient } = FSBL.Clients;
var { LauncherClient } = FSBL.Clients;

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", FSBLReady);
} else {
	window.addEventListener("FSBLReady", FSBLReady);
}
function FSBLReady() {
	const TESTRUNNER_CHANNEL_NAME = `TestRunner.${
		fin.desktop.Window.getCurrent().name
	}.windowTitleBar`;

	function clickLinker() {
		return new Promise((resolve, reject) => {
			document.querySelector(".fsbl-linker").click();
			setTimeout(resolve, 1000);
		});
	}

	function getLinkerGroupClasses() {
		return new Promise((resolve, reject) => {
			resolve(
				Array.from(document.querySelectorAll(".linker-group")).map(
					(el) => el.className
				)
			);
		});
	}
	RouterClient.addResponder(TESTRUNNER_CHANNEL_NAME, (err, message) => {
		function sendSuccess(data) {
			message.sendQueryResponse(null, data || "Success");
		}
		function sendError(error) {
			let err = {};
			err.message = error;
			if (error.message) {
				err.message = error.message;
			}
			message.sendQueryResponse(err, null);
		}
		//second responder added.
		if (err) {
			return;
		}
		let { data } = message;
		switch (data.test) {
			case "clickLinker":
				clickLinker()
					.then(sendSuccess)
					.catch(sendError);

				break;
			case "getLinkerGroupClasses":
				getLinkerGroupClasses()
					.then(sendSuccess)
					.catch(sendError);
				break;
		}
	});
}
