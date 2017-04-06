
var owed={
	"123456789": "$ 59.12",
	"23456789": "$ 591.00",
	"3456789": "$ 129.83",
	"456789": "$ 61.10",
	"56789": "$ 89.25",
}

function saveState(accountNumber){
	FSBL.Clients.WindowClient.setComponentState({ field: 'accountNumber', value: accountNumber });
}

function getState(){
	FSBL.Clients.WindowClient.getComponentState({
		field: 'accountNumber',
	}, function (err, state) {
		if (state === null) {
			return;
		}
		displayAccount(state);
	});
}

function displayAccount(accountNumber){
	$("account").text(accountNumber);
	$("owed").text(owed[accountNumber]);
	saveState(accountNumber);
}

function createLinkage(){
	FSBL.Clients.LinkerClient.subscribe("account", function(obj){
		displayAccount(obj);
	});
}

document.addEventListener("DOMContentLoaded", function () {
	FSBL.useAllClients();
	FSBL.initialize(function(){
		createLinkage();
		getState();
	});
})