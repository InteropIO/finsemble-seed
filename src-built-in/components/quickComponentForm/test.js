var chai = require("chai");
var assert = chai.assert;
var should = chai.should;
var expect = chai.expect;
var RouterClient = FSBL.Clients.RouterClient;
var LauncherClient = FSBL.Clients.LauncherClient;
var merge = require("deepmerge");
RouterClient.addResponder("TestRunner.QuickComponentForm", function (response, message) {
	function sendSuccess(data) {
		message.sendQueryResponse(null, data || "success");
	}
	function sendError(error) {
		message.sendQueryResponse(error, null);
	}
	let data = message.data;

	switch (data.test) {
	case "create":
		createComponent(data)
				.then(sendSuccess)
				.catch(sendError);
		break;
	}
});
function createComponent(data) {
	return new Promise(function (resolve, reject) {
		let name = document.getElementById("Name"),
			url = document.getElementById("Url"),
			saveButton = document.getElementById("SaveButton");
		name.value = data.name;
		url.value = data.url;
		resolve();
		saveButton.click();
	});
}

