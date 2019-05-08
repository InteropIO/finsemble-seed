
var owed = {
	"12345678": "$ 59.12",
	"23456789": "$ 591.00",
	"34567890": "$ 129.83",
	"45678901": "$ 61.10",
	"56789012": "$ 89.25",
}

function saveState(accountNumber) {
	FSBL.Clients.WindowClient.setComponentState({ field: 'accountNumber', value: accountNumber });
}

function getState() {
	FSBL.Clients.WindowClient.getComponentState({
		field: 'accountNumber',
	}, function (err, state) {
		if (state === null) {
			return;
		}
		displayAccount(state);
	});
}

function displayAccount(accountNumber) {
	$("account").text(accountNumber);
	$("owed").text(owed[accountNumber]);
	saveState(accountNumber);
}

function createLinkage() {
	FSBL.Clients.LinkerClient.subscribe("account", function (obj) {
		displayAccount(obj);
	});
}

if (window.FSBL && FSBL.addEventListener) { FSBL.addEventListener("onReady", FSBLReady); } else { window.addEventListener("FSBLReady", FSBLReady) }
function FSBLReady() {
	createLinkage();
	getState();
}
