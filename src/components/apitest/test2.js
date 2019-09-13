let routerSubId
var dsStore

function renderPage() {
	/* Linker client button */
	const linkerSub = $("<linkerSub>Linker Subscribe</linkerSub></br>");
	linkerSub.click(function () {
		triggerLinkerSub();
	});
	$("#functionBtns").append(linkerSub);
	const linkerUnsub = $("<linkerUnsub>Linker Unsubscribe</linkerUnsub></br>");
	linkerUnsub.click(function () {
		triggerLinkerUnsub();
	});
	$("#functionBtns").append(linkerUnsub);

	/* Router client buttons */
	const routerSub = $("<routerSub>Router Subscribe</routerSub><p class='instruct'>Add Pub sub Responder in 'API Testing 1' before subscribe</p></br>");
	routerSub.click(function () {
		triggerRouterSub();
	});
	$("#functionBtns").append(routerSub);
	const routerUnsub = $("<routerUnsub>Router Unsubscribe</routerUnsub></br>");
	routerUnsub.click(function () {
		triggerRouterUnsub();
	});
	$("#functionBtns").append(routerUnsub);
	const routerAddResponder = $("<routerAddResponder>Router Add Responder</routerAddResponder></br>");
	routerAddResponder.click(function () {
		triggerRouterAddResponder();
	});
	$("#functionBtns").append(routerAddResponder);
	const routerRemoveResponder = $("<routerRemoveResponder>Router Remove Responder</routerRemoveResponder></br>");
	routerRemoveResponder.click(function () {
		triggerRouterRemoveResponder();
	});
	$("#functionBtns").append(routerRemoveResponder);
	const routerAddListener = $("<routerAddListener>Router Add Listener</routerAddListener></br>");
	routerAddListener.click(function () {
		triggerRouterAddListener();
	});
	$("#functionBtns").append(routerAddListener);
	const routerRemoveListener = $("<routerRemoveListener>Router Remove Listener</routerRemoveListener></br>");
	routerRemoveListener.click(function () {
		triggerRouterRemoveListener();
	});
	$("#functionBtns").append(routerRemoveListener);
	const routerDisconnectAll = $("<routerDisconnectAll>Router Disconnect All</routerDisconnectAll></br>");
	routerDisconnectAll.click(function () {
		triggerRouterDisconnectAll();
	});
	$("#functionBtns").append(routerDisconnectAll);

	/* DistributedStore Client buttons */
	const addStoreListener = $("<addStoreListener>Add Store Listeners</addStoreListener></br>");
	addStoreListener.click(function () {
		triggerAddStoreListener();
	});
	$("#functionBtns").append(addStoreListener);
	const removeStoreListener = $("<removeStoreListener>Remove Store Listeners</removeStoreListener></br>");
	removeStoreListener.click(function () {
		triggerRemoveStoreListener();
	});
	$("#functionBtns").append(removeStoreListener);
}
/* DistributedStore Client functions */
function triggerRemoveStoreListener() {
	if (dsStore)
		dsStore.removeListeners([{
			field: 'field1',
			listener: onFieldDataChange
		}, {
			field: 'field2',
			listener: onFieldDataChange
		}], null, function (err) {
			if (!err)
				setDisplayMsg('Distributed store listeners removed.')

		});
	else
		setDisplayMsg('No such store. Please create distributed store in "API Testing 1"')
}

function triggerAddStoreListener() {
	FSBL.Clients.DistributedStoreClient.getStore({
		store: 'testDs1',
	}, function (err, store) {
		if (!err) {
			dsStore = store
			store.addListeners(['field1', 'field2'], onFieldDataChange, function (err) {
				if (!err)
					setDisplayMsg('Distributed store listeners added.')
			});
		} else
			setDisplayMsg('No such store. Please create distributed store in "API Testing 1"', err)
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
	FSBL.Clients.RouterClient.disconnectAll()
	setDisplayMsg('Disconnected all.')
}

function triggerRouterRemoveListener() {
	FSBL.Clients.RouterClient.removeListener('symbol', onRouterValueChanged)
	setDisplayMsg('Router listener removed.')
}

function triggerRouterAddListener() {
	FSBL.Clients.RouterClient.addListener('symbol', onRouterValueChanged)
	setDisplayMsg('Router listener added.')
}

function onRouterValueChanged(err, response) {
	if (!err) {
		if (response.data.data)
			$("routerSymbolListenTran").text(response.data.data);
	}
}

function triggerRouterRemoveResponder() {
	FSBL.Clients.RouterClient.removeResponder('symbol')
	setDisplayMsg('Router client reponder removed.')
}

function triggerRouterAddResponder() {
	FSBL.Clients.RouterClient.addResponder("symbol", function (err, queryMessage) {
		if (!err) {
			setDisplayMsg("Router query incoming data=" + queryMessage.data.queryKey)
			var response = "router query response data"; // Responses can be objects or strings
			queryMessage.sendQueryResponse(null, response); // The callback must respond, else a timeout will occur on the querying client.
		}
	})
	setDisplayMsg("Router client responder added.")
}

function triggerRouterUnsub() {
	FSBL.Clients.RouterClient.unsubscribe({
		'subscribeID': routerSubId,
		'topic': 'symbol'
	})
	setDisplayMsg('Router unsubscribed.')
}

function triggerRouterSub() {
	FSBL.Clients.RouterClient.subscribe('symbol', function (err, notify) {
		if (!err) {
			if (notify.data.symbol)
				$("routerSymbolPubSub").text(notify.data.symbol);
			else {
				routerSubId = notify.header.subscribeID
			}

		}
	})
	setDisplayMsg('Router subscribed.')
}


/* linker client functions */
function triggerLinkerSub() {
	FSBL.Clients.LinkerClient.subscribe('symbol', function (data, response) {
		$("linkerSymbol").text(data);
	})
	setDisplayMsg('Linker subscribed.')
}

function triggerLinkerUnsub() {
	FSBL.Clients.LinkerClient.unsubscribe('symbol')
	setDisplayMsg('Linker unsubscribed.')
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
	FSBL.Clients.DragAndDropClient.addReceivers({
		receivers: [{
			type: 'symbol',
			handler: getEverythingAComponentCanEmit
		}]
	});
}

function getEverythingAComponentCanEmit(err, response) {
	if (!err) {
		if (response.data.symbol) {
			$("draganddropSymbol").text(response.data.symbol);
			setDisplayMsg('Date received through drag and drop.', response)
		}

	}
}

function setDisplayMsg(msg, respondObj, append) {
	if (append)
		document.getElementById('displayMsg').value += '\n\n' + msg + '\n\n'
	else
		document.getElementById('displayMsg').value = msg + '\n\n'
	if (respondObj)
		document.getElementById('displayMsg').value += JSON.stringify(respondObj)
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