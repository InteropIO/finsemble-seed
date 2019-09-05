const dragAndDropClient = FSBL.Clients.DragAndDropClient
const linkerClient = FSBL.Clients.LinkerClient
const routerClient = FSBL.Clients.RouterClient
const dsClient = FSBL.Clients.DistributedStoreClient
var routerSubId
var dsStore

function renderPage() {
	/* Linker client button */
	var linkerSub = $("<linkerSub>Linker Subscribe</linkerSub>");
	linkerSub.click(function () {
		triggerLinkerSub();
	});
	$("body").append(linkerSub);
	var linkerUnsub = $("<linkerUnsub>Linker Unsubscribe</linkerUnsub>");
	linkerUnsub.click(function () {
		triggerLinkerUnsub();
	});
	$("body").append(linkerUnsub);

	/* Router client buttons */
	var routerSub = $("<routerSub>Router Subscribe</routerSub>");
	routerSub.click(function () {
		triggerRouterSub();
	});
	$("body").append(routerSub);
	var routerUnsub = $("<routerUnsub>Router Unsubscribe</routerUnsub>");
	routerUnsub.click(function () {
		triggerRouterUnsub();
	});
	$("body").append(routerUnsub);
	var routerAddResponder = $("<routerAddResponder>Router Add Responder</routerAddResponder>");
	routerAddResponder.click(function () {
		triggerRouterAddResponder();
	});
	$("body").append(routerAddResponder);
	var routerRemoveResponder = $("<routerRemoveResponder>Router Remove Responder</routerRemoveResponder>");
	routerRemoveResponder.click(function () {
		triggerRouterRemoveResponder();
	});
	$("body").append(routerRemoveResponder);
	var routerAddListener = $("<routerAddListener>Router Add Listener</routerAddListener>");
	routerAddListener.click(function () {
		triggerRouterAddListener();
	});
	$("body").append(routerAddListener);
	var routerRemoveListener = $("<routerRemoveListener>Router Remove Listener</routerRemoveListener>");
	routerRemoveListener.click(function () {
		triggerRouterRemoveListener();
	});
	$("body").append(routerRemoveListener);
	var routerDisconnectAll = $("<routerDisconnectAll>Router Disconnect All</routerDisconnectAll>");
	routerDisconnectAll.click(function () {
		triggerRouterDisconnectAll();
	});
	$("body").append(routerDisconnectAll);

	/* DistributedStore Client buttons */
	var addStoreListener = $("<addStoreListener>Add Store Listeners</addStoreListener>");
	addStoreListener.click(function () {
		triggerAddStoreListener();
	});
	$("body").append(addStoreListener);
	var removeStoreListener = $("<removeStoreListener>Remove Store Listeners</removeStoreListener>");
	removeStoreListener.click(function () {
		triggerRemoveStoreListener();
	});
	$("body").append(removeStoreListener);
}
/* DistributedStore Client functions */
function triggerRemoveStoreListener() {
	dsStore.removeListeners([{
		field: 'field1',
		listener: onFieldDataChange
	}, {
		field: 'field2',
		listener: onFieldDataChange
	}], null, function (err) {
		if (!err)
			alert('Distributed store listeners removed.')
	});
}

function triggerAddStoreListener() {
	dsClient.getStore({
		store: 'testDs1',
	}, function (err, store) {
		if (!err) {
			dsStore = store
			store.addListeners(['field1', 'field2'], onFieldDataChange, function (err) {
				if (!err)
					alert('Distributed store listeners added.')
			});
		} else
			alert('No such store.')
	})
}

function onFieldDataChange(err, newData) {
	if (newData.field.includes('field1'))
		$("dsField1").text(newData.value);
	else if (newData.field.includes('field2'))
		$("dsField2").text(newData.value);
}

/* Router client functions */
function triggerRouterDisconnectAll() {
	routerClient.disconnectAll()
	alert('Disconnected all.')
}

function triggerRouterRemoveListener() {
	routerClient.removeListener('symbol', onRouterValueChanged)
	alert('Router listener removed.')
}

function triggerRouterAddListener() {
	routerClient.addListener('symbol', onRouterValueChanged)
	alert('Router listener added.')
}

function onRouterValueChanged(err, response) {
	if (!err) {
		if (response.data.data)
			$("routerSymbolListenTran").text(response.data.data);
	}
}

function triggerRouterRemoveResponder() {
	routerClient.removeResponder('symbol')
	alert('Router client reponder removed.')
}

function triggerRouterAddResponder() {
	routerClient.addResponder("symbol", function (err, queryMessage) {
		if (!err) {
			alert("Router query incoming data=" + queryMessage.data.queryKey)
			var response = "router query response data"; // Responses can be objects or strings
			queryMessage.sendQueryResponse(null, response); // The callback must respond, else a timeout will occur on the querying client.
		}
	})
	alert("Router client responder added.")
}

function triggerRouterUnsub() {
	routerClient.unsubscribe({
		'subscribeID': routerSubId,
		'topic': 'symbol'
	})
	alert('Router unsubscribed.')
}

function triggerRouterSub() {
	routerClient.subscribe('symbol', function (err, notify) {
		if (!err) {
			if (notify.data.symbol)
				$("routerSymbolPubSub").text(notify.data.symbol);
			else {
				routerSubId = notify.header.subscribeID
			}

		}
	})
	alert('Router subscribed.')
}


/* linker client functions */
function triggerLinkerSub() {
	linkerClient.subscribe('symbol', function (data, response) {
		$("linkerSymbol").text(data);
	})
	alert('Linker subscribed.')
}

function triggerLinkerUnsub() {
	linkerClient.unsubscribe('symbol')
	alert('Linker unsubscribed.')
}



function saveState(accountNumber) {
	FSBL.Clients.WindowClient.setComponentState({
		field: 'accountNumber',
		value: accountNumber
	});
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

function setupReceiver() {
	dragAndDropClient.addReceivers({
		receivers: [{
			type: 'symbol',
			handler: getEverythingAComponentCanEmit
		}]
	});
}

function getEverythingAComponentCanEmit(err, response) {
	if (!err) {
		//console.log(response)
		if (response.data.symbol)
			$("draganddropSymbol").text(response.data.symbol);

	}
}

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", FSBLReady);
} else {
	window.addEventListener("FSBLReady", FSBLReady)
}

function FSBLReady() {
	renderPage()
	setupReceiver()
}