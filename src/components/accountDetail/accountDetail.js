var customer = null;

function setCustomer(cust) {
	customer = cust;
	$("input[name=accountNumber]").val(customer.acc);
	$("input[name=name]").val(customer.name);
	$("input[name=phone]").val(customer.phone);
	FSBL.Clients.WindowClient.setWindowTitle(customer.acc);
	FSBL.Clients.LinkerClient.publish({ dataType: "account", data: customer.acc });
	setState();
}

// STEP 2.2.3
function getInitialCustomer() {
	var customer = FSBL.Clients.WindowClient.getSpawnData()["customer"];
	if (customer) {
		setCustomer(customer);
	}
}


// STEP 2.2.10
function listenForCustomer() {
	FSBL.Clients.RouterClient.addListener(FSBL.Clients.WindowClient.options.name, function (err, response) {
		if (err) return;
		setCustomer(response.data);
	});
}


// STEP 3.1
function setState() {
	// FSBL.Clients.WindowClient.setComponentState({ field: 'customer', value: customer });
}
function getState() {
	// FSBL.Clients.WindowClient.getComponentState({
	// 	field: 'customer',
	// }, function (err, state) {
	// 	if (state) {
	// 		setCustomer(state);
	// 	}
	// });
}

// STEP 4.1
function communicateBetweenComponents() {
	// function traversalFn(direction) {
	// 	console.log("traveral dir: " + direction);
	// 	FSBL.Clients.RouterClient.query("accountTraversal", { action: direction }, function (err, response) {
	// 		if (err) {
	// 			alert("Error: " + err);
	// 		} else {
	// 			setCustomer(response.data);
	// 		}
	// 	});
	// }

	// $("next").click(function() {console.log("NEXT"); traversalFn("next")});
	// $("prev").click(function() {console.log("PREV"); traversalFn("prev")});
}

/**
 * Everything needs to happen after Finsemble is ready
 */
if (window.FSBL && FSBL.addEventListener) { FSBL.addEventListener("onReady", FSBLReady); } else { window.addEventListener("FSBLReady", FSBLReady) }
function FSBLReady() {
	getInitialCustomer();
	getState();
	listenForCustomer();
	communicateBetweenComponents();
}
