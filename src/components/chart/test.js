var chai = require('chai');
var assert = chai.assert;
var should = chai.should;
var expect = chai.expect;
var RouterClient = FSBL.Clients.RouterClient;
var LauncherClient = FSBL.Clients.LauncherClient;
const TESTRUNNER_CHANNEL_NAME = `TestRunner.${fin.desktop.Window.getCurrent().name}.AdvancedChart`;
RouterClient.addResponder(TESTRUNNER_CHANNEL_NAME, function (err, message) {
	function sendSuccess(data) {
		message.sendQueryResponse(null, data || 'Success');
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
	let data = message.data;
	switch (data.test) {
		case 'getSymbol':
			sendSuccess(UIContext.stx.chart.symbol);
			break;
		case 'changeSymbol':
			UIContext.UISymbolLookup.selectItem({ symbol: message.data.symbol });
			setTimeout(sendSuccess, 1000);
			break;
	};
});
