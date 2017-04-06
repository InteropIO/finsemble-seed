
function setAccountNumber(accountNumber){
	$("input[name=accountNumber").val(accountNumber);
	FSBL.Clients.WindowClient.setWindowTitle(accountNumber);
	FSBL.Clients.LinkerClient.publish({dataType:"account", data:accountNumber});
	saveState(accountNumber);
}

// STEP 6
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
		setAccountNumber(state);
	});
}

// STEP 4
function communicateBetweenComponents(){
	$("next").click(function(){
		FSBL.Clients.RouterClient.query("accountTraversal", {action:"next"}, function(err, response){
			if(err){
				alert("Error: " + err);
			}else{
				setAccountNumber(response.data);
			}
		});
	});
}

// STEP 3
function listenForCustomer(){
	FSBL.Clients.RouterClient.addListener(FSBL.Clients.WindowClient.options.name, function(err, response){
		if(err) return;
		setAccountNumber(response.data);
	})
}

// STEP 2
function getInitialCustomer(){
	var accountNumber=FSBL.Clients.WindowClient.options.customData.component["accountNumber"];
	setAccountNumber(accountNumber);
}

document.addEventListener("DOMContentLoaded", function () {
	FSBL.useAllClients();
	FSBL.initialize(function(){
		getInitialCustomer();
		listenForCustomer();
		communicateBetweenComponents();
		getState();
	});
})