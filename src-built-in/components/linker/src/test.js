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
	var parentWindow, TESTRUNNER_CHANNEL_NAME;
	FSBL.Utils.getWindowDescriptor().then((windowDescriptor) => {
		var data = windowDescriptor.customData;
		if (data) {
			if (data.window) {
				parentWindow = fin.desktop.Window.wrap(data.uuid, data.window);
				TESTRUNNER_CHANNEL_NAME = `TestRunner.${parentWindow.name}.Linker`;
				function chooseColor(color) {
					return new Promise((resolve, reject) => {
						let button = document.querySelector(`.${color}`);
						try {
							button.click();
							setTimeout(resolve, 1000);
						} catch (e) {
							reject(e);
						}
					});
				}
				function getLinkerGroupClasses() {
					return new Promise((resolve, reject) => {
						resolve(
							Array.from(document.querySelectorAll(".linkerGroup")).map(
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
						case "chooseColor":
							chooseColor(data.color)
								.then(sendSuccess)
								.catch(sendError);
							break;
						case "getLinkerGroupClasses":
							getLinkerGroupClasses(data.color)
								.then(sendSuccess)
								.catch(sendError);
							break;
					}
				});
			}
		}
	});
}
