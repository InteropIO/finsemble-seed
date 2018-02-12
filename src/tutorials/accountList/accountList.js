/* List of Customers */
customers = [
	{acc: "12345678", name: "Sam Smith", phone: "555-555-5555"},
	{acc: "23456789", name: "Bill Branson", phone: "555-555-5556"},
	{acc: "34567890", name: "Tom Thomson", phone: "555-555-5557"},
	{acc: "45678901", name: "Jim Jackson", phone: "555-555-5558"},
	{acc: "56789012", name: "Ernie Edmonson", phone: "555-555-5559"}
];

/**
 * Very basic code to create a row of data for each customer in our array
 */
function renderPage() {
	var template = $("template")[0];
	for (let customer of customers) {
		var row = $(document.importNode(template.content, true));
		row.find("account").text(customer.acc);
		row.find("name").text(customer.name);
		row.find("account").parent().click(customer.acc, clickCustomer);
		$("#customers").append(row);
	}

	var relocate = $("<relocate>Relocate Detail</relocate>");
	relocate.click(function () {
		relocateAccountDetail();
	});
	$("body").append(relocate);
}

var customerIndex = -1;
function setCustomer(accountNumber) {
	$("#customers customer").removeClass("selected");
	var i;
	for (i = 0; i < customers.length; i++) {
		if (customers[i].acc === accountNumber) {
			customerIndex = i;
			$('#customers customer account:contains('+accountNumber+')').parent().addClass("selected");
			break;
		} 
	}
	setState();
}

var advancedIsRunning = false;
var accountDetailSpawnResponse = null;

function clickCustomer(event) {

	launchAccountDetailAdvanced(event.data); // --> Step 2.2.7
	launchAccountDetail(event.data); // --> Step 2.2.3
}

// STEP 2.2.3
function launchAccountDetail(selectedAccountNumber) {
	if (advancedIsRunning) return;
	setCustomer(selectedAccountNumber);

	// FSBL.Clients.LauncherClient.spawn("accountDetail",
	// 	{
	// 		addToWorkspace: true,
	// 		left: "adjacent",
	// 		data: {customer: customers[customerIndex]}
	// 	}, function(err, response){
	// 		console.log("spawn() returns information about the new component", response);
	// 		accountDetailSpawnResponse=response;
	// 	}
	// );
}

// STEP 2.2.7
function launchAccountDetailAdvanced(selectedAccountNumber) {
	// advancedIsRunning=true;
	// setCustomer(selectedAccountNumber);

	// // A windowIdentifier describes a component window. We create a unique windowName by using our current window's name and appending.
	// // showWindow() will show this windowName if it's found. If not, then it will launch a new accountDetail coponent, and give it this name.
	// var windowIdentifier={
	// 	componentType: "accountDetail",
	// 	windowName: FSBL.Clients.WindowClient.options.name + ".accountDetail"
	// };

	// FSBL.Clients.LauncherClient.showWindow(windowIdentifier,
	// 	{
	// 		addToWorkspace: true,
	// 		left: "adjacent",
	// 		spawnIfNotFound: true,
	// 		data: {customer: customers[customerIndex]}
	// 	}, function(err, response){
	// 		console.log("spawn() returns information about the new component", response);
	// 		accountDetailSpawnResponse=response;
	// 		// After the component is launched, or displayed, we tell the child which customer to use.
	// 		FSBL.Clients.RouterClient.transmit(windowIdentifier.windowName, customers[customerIndex]);
	// 	}
	// );
}

function relocateAccountDetail() {
	FSBL.Clients.LauncherClient.showWindow(accountDetailSpawnResponse.windowIdentifier,
		{
			left: "aligned",
			top: "adjacent"
		});
}

//STEP 3.1
/**
 * Sets the state of a component to the Workspace
 */
function setState() {
	// FSBL.Clients.WindowClient.setComponentState({ field: 'customerIndex', value: customerIndex });
}

/**
 * Gets the the stored state of a component
 */
function getState() {
	// FSBL.Clients.WindowClient.getComponentState({
	// 	field: 'customerIndex',
	// }, function (err, state) {
	// 	if (state === null) {
	// 		return;
	// 	}
	// 	setCustomer(customers[state].acc);
	// });
}

// STEP 4.1
/**
 * Set up a responder to respond to requests from clients.
 * When clients send requests for the next customer in the list, we will respond by traversing through the customer list and sending the response.
 */
function communicateBetweenComponents() {
	// FSBL.Clients.RouterClient.addResponder("accountTraversal", function (err, query) {
	// 	if (err) return;
	// 	var newIndex = customerIndex;
	// 	if (query.data.action === "next") {
	// 		newIndex++;
	// 		if (newIndex >= customers.length) newIndex = 0;
	// 	} else if (query.data.action === "prev") {
	// 		newIndex--;
	// 		if (newIndex < 0) newIndex = customers.length - 1;
	// 	}
	// 	setCustomer(customers[newIndex].acc);
	// 	// Respond to the accountDetail client with the next customer
	// 	query.sendQueryResponse(null, customers[customerIndex]);
	// });
}

FSBL.addEventListener("onReady", function () {
	//alert(FSBL.Clients.WindowClient.options.customData.component["account-type"]); // --> Step 1.4

	FSBL.Clients.WindowClient.setWindowTitle("Account List");
	renderPage();
	getState(); // --> Step 3.1
	communicateBetweenComponents(); // --> Step 4.1
});