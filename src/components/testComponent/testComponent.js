var path = require('path');
var testClient = require('../../clients/testClient.js');

FSBL.addClient('TestClient', testClient);
FSBL.useAllClients();

FSBL.initialize(onReady);

var StorageClient = FSBL.Clients.StorageClient,
	LinkerClient = FSBL.Clients.LinkerClient,
	WindowClient = FSBL.Clients.WindowClient,
	TestClient = testClient,
	myInput,
	myButton;

function setInputValue(val) {
	myInput.value = val;
	saveState();
}
function saveState() {
	WindowClient.setAppState({
		field: 'symbol',
		value: myInput.value
	});
}
function restoreState() {
	WindowClient.getAppState({
		field: 'symbol'
	}, function (err, state) {
		if (err) {
			alert(err.message);
			return;
		}
		setInputValue(state);
	});
}

function handleInputKeyup(e) {
	saveState();
	if (e.keyIdentifier === 'enter') {
		publishSymbolChange();
	}
}
function publishSymbolChange() {
	LinkerClient.publish('symbol', myInput.value);
}

function spawnADialog() {
	TestClient.spawnADialog();
}
function onReady() {
	
	//gathering references.
	myInput = document.querySelector('#linkerInput');
	myButton = document.querySelector('#linkerButton');
	dialogButton = document.querySelector('#dialogButton');
	//Broadcast changes when the user clicks our button.
	myInput.addEventListener('keyup', handleInputKeyup);
	myButton.addEventListener('click', publishSymbolChange);
	//When symbol changes, set it locally.
	LinkerClient.registerListener('symbol', function (symbol) {
		setInputValue(symbol);
	});
	
	dialogButton.addEventListener('click', spawnADialog);
	restoreState();
}

var myComponent = {};
module.exports = myComponent;