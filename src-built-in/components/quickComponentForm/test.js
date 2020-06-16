var chai = require("chai");
var { assert } = chai;
var { should } = chai;
var { expect } = chai;
var { RouterClient } = FSBL.Clients;
var { LauncherClient } = FSBL.Clients;
var merge = require("deepmerge");
RouterClient.addResponder(
	"TestRunner.QuickComponentForm",
	(response, message) => {
		function sendSuccess(data) {
			message.sendQueryResponse(null, data || "success");
		}
		function sendError(error) {
			message.sendQueryResponse(error, null);
		}
		let { data } = message;

		switch (data.test) {
			case "create":
				createComponent(data)
					.then(sendSuccess)
					.catch(sendError);
				break;
		}
	}
);
function createComponent(data) {
	return new Promise((resolve, reject) => {
		let name = document.getElementById("Name"),
			url = document.getElementById("Url"),
			saveButton = document.getElementById("SaveButton");
		name.value = data.name;
		url.value = data.url;
		resolve();
		saveButton.click();
	});
}
