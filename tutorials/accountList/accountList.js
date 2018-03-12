/* List of Customers */

var customers = [
	["12345678", "Sam Smith"],
	["23456789", "Bill Branson"],
	["34567890", "Tom Thomson"],
	["45678901", "Jim Jackson"],
	["56789012", "Ernie Edmonson"],
];

/**
 * Very basic code to create a row of data for each customer in our array
 */
function renderPage() {
	var template = $("template")[0];
	for (let customer of customers) {
		var row = $(document.importNode(template.content, true));
		row.find("account").text(customer[0]);
		row.find("name").text(customer[1]);
		row.find("account").parent().click(customer[0], clickCustomer);
		$("body").append(row);
	}

	var relocate = $("<button>Relocate Detail</button>");
	relocate.click(function () {
		relocateAccountDetail();
	});
	$("body").append(relocate);
}

var customerIndex = -1;
function setCustomerIndex(accountNumber) {
	var i;
	for (i = 0; i < customers.length; i++) {
		if (customers[i][0] === accountNumber) {
			customerIndex = i;
		}
	}
	if (i == customers.length) customerIndex = 0;
	setState();
}


var advancedIsRunning = false;
var accountDetailSpawnResponse = null;

function clickCustomer(event) {
	launchAccountDetailAdvanced(event.data); // --> Step 3
	launchAccountDetail(event.data); // --> Step 5
}

// STEP 5
function launchAccountDetail(selectedAccountNumber) {
	if (advancedIsRunning) return;
	setCustomerIndex(selectedAccountNumber);

	/*
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
	*/
}

// STEP 6
function launchAccountDetailAdvanced(selectedAccountNumber) {
	/*
	advancedIsRunning=true;

	// A windowIdentifier describes a component window. We create a unique windowName by using our current window's name and appending.
	// showWindow() will show this windowName if it's found. If not, then it will launch a new accountDetail coponent, and give it this name.
	var windowIdentifier={
		componentType: "accountDetail",
		windowName: FSBL.Clients.WindowClient.options.name + ".accountDetail"
	};

	FSBL.Clients.LauncherClient.showWindow(windowIdentifier,
		{
			addToWorkspace: true,
			left: "adjacent",
			spawnIfNotFound: true,
			data: {accountNumber: selectedAccountNumber}
		}, function(err, response){
			console.log("spawn() returns information about the new component", response);
			accountDetailSpawnResponse=response;
			// After the component is launched, or displayed, we tell the child which account number to use.
			FSBL.Clients.RouterClient.transmit(windowIdentifier.windowName, selectedAccountNumber);
		}
	);
	*/
}

// STEP 7
/**
 * Set up a responder to respond to requests from clients.
 * When clients send requests for the next customer in the list, we will respond by traversing through the customer list and sending the response.
 */
function communicateBetweenComponents() {
	/*
	FSBL.Clients.RouterClient.addResponder("accountTraversal", function (err, query) {
		if (err) return;
		if (query.data.action === "next") {
			customerIndex++;
			if (customerIndex == customers.length) customerIndex = 0;
		} else if (query.data.action === "prev") {
			customerIndex--;
			if (customerIndex === -1) customerIndex = customers.length - 1;
		}
		setState();

		// Respond to the accountDetail client with the next customer
		query.sendQueryResponse(null, customers[customerIndex][0]);
	});
	*/
}

//STEP 9
/**
 * Sets the state of a component to the Workspace
 */
function setState() {
	/*
	FSBL.Clients.WindowClient.setComponentState({ field: 'customerIndex', value: customerIndex });
	*/
}

/**
 * Gets the the stored state of a component
 */
function getState() {
	/*
	FSBL.Clients.WindowClient.getComponentState({
		field: 'customerIndex',
	}, function (err, state) {
		if (state === null) {
			return;
		}
		customerIndex = state;
	});
	*/
}

function relocateAccountDetail() {
	FSBL.Clients.LauncherClient.showWindow(accountDetailSpawnResponse.windowIdentifier,
		{
			left: "aligned",
			top: "adjacent"
		});
}

/**
 * Everything needs to happen after Finsemble is ready
 */
FSBL.addEventListener("onReady", function () {
	//alert(FSBL.Clients.WindowClient.options.customData.component["account-type"]); // --> STEP 3

	FSBL.Clients.WindowClient.setWindowTitle("Account List");
	renderPage();
	communicateBetweenComponents(); // --> Step 7
	getState(); // --> Step 9
});