var customers=[
["12345678","Sam Smith"],
["23456789","Bill Branson"],
["34567890","Tom Thomson"],
["45678901","Jim Jackson"],
["56789012","Ernie Edmonson"],
];

var customerIndex=-1;
function setCustomerIndex(accountNumber){
	for(var i=0;i<customers.length;i++){
		if(customers[i][0]==accountNumber){
			customerIndex=i;
		}
	}
	if(i==customers.length) customerIndex=0;
	saveState();
}

var advancedIsRunning=false;
var accountDetailSpawnResponse=null;

//STEP 6
function saveState(){
	FSBL.Clients.WindowClient.setComponentState({ field: 'customerIndex', value: customerIndex });
}
function getState(){
	FSBL.Clients.WindowClient.getComponentState({
		field: 'customerIndex',
	}, function (err, state) {
		if (state === null) {
			return;
		}
		customerIndex=state;
	});
}

// STEP 4
function communicateBetweenComponents(){
	// Set up a server to respond to requests from clients. Here, clients will send requests for the next customer in the list.
	// We will respond by traversing through the customer list and sending the response
	FSBL.Clients.RouterClient.addResponder("accountTraversal", function(err, query){
		if(err) return;
		if(query.data.action=="next"){
			customerIndex++;
			if(customerIndex==customers.length) customerIndex=0;
		}else if(query.data.action=="prev"){
			customerIndex--;
			if(customerIndex==-1) customerIndex=customers.length-1;
		}
		saveState();

		// Respond to the accountDetail client with the next customer
		query.sendQueryResponse(null, customers[customerIndex][0]);
	});
}

// STEP 3
function launchAccountDetailAdvanced(accountNumber){
/**/
	advancedIsRunning=true;
	var alive=false;
	FSBL.Clients.LauncherClient.getActiveDescriptors(function(err, response){
		advancedIsRunning=false;
		for(let id in response){
			var descriptor=response[id];
			if(descriptor.customData.component.type=="accountDetail"){
				alive=true;
				break;
			}
		}
		if(!alive){
			launchAccountDetail(accountNumber);
		}else{
			FSBL.Clients.RouterClient.transmit(descriptor.name, accountNumber);
		}
	});

}

// STEP 2
function launchAccountDetail(selectedAccountNumber){
	if(advancedIsRunning) return;
	setCustomerIndex(selectedAccountNumber);

/**/
	FSBL.Clients.LauncherClient.spawn("accountDetail",
		{
			addToWorkspace: true,
			left: "adjacent",
			data: {accountNumber: selectedAccountNumber}
		}, function(err, response){
			console.log("spawn() returns information about the new component", response);
			accountDetailSpawnResponse=response;
		}
	);
}

function relocateAccountDetail(){
	FSBL.Clients.LauncherClient.showWindow(accountDetailSpawnResponse.windowIdentifier,
	{
		left:"aligned",
		top:"adjacent"
	});
}

function clickCustomer(event){
	launchAccountDetailAdvanced(event.data); // --> Step 3
	launchAccountDetail(event.data); // --> Step 2
}

function renderPage(){
	/* Very basic code to create a row of data for each customer in our array */
	var template=$("template")[0];
	for(let customer of customers){
		var row=$(document.importNode(template.content, true));
		row.find("account").text(customer[0]);
		row.find("name").text(customer[1]);
		row.find("account").parent().click(customer[0], clickCustomer);
		$("body").append(row);
	}

	var relocate=$("<button>Relocate Detail</button>");
	relocate.click(function(){
		relocateAccountDetail();
	});
	$("body").append(relocate);
}

FSBL.addEventListener("onReady", function () {
	//alert(FSBL.Clients.WindowClient.options.customData.component["account-type"]);

	FSBL.Clients.WindowClient.setWindowTitle("Account List");
	renderPage();
	communicateBetweenComponents(); // --> Step 4
	getState();
})