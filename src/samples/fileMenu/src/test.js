var chai = require("chai");
var assert = chai.assert;
var should = chai.should;
var expect = chai.expect;
var RouterClient = FSBL.Clients.RouterClient;
var LauncherClient = FSBL.Clients.LauncherClient;
function openDocumentation() {
	return new Promise(function (resolve, reject) {
		try {
			document.getElementById("Documentation").click();
			setTimeout(resolve, 3000);
		} catch (e) {
			reject(e);
		}
	});
}

RouterClient.addResponder("TestRunner.FileMenu", function (err, message) {
	function sendSuccess() {
		message.sendQueryResponse(null, "Success");
	}
	function sendError(error) {
		message.sendQueryResponse(error, null);
	}
	let data = message.data;

	switch (data.test) {
	case "openDocumentation":
		openDocumentation()
				.then(sendSuccess)
				.catch(sendError);
		break;
	}
});