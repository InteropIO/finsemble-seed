//setup all the clients to be used
const dragdropClient = FSBL.Clients.DragAndDropClient;
const hotkeyClient = FSBL.Clients.HotkeyClient;
const distributedStoreClient = FSBL.Clients.DistributedStoreClient
const launcherClient = FSBL.Clients.LauncherClient
const windowClient = FSBL.Clients.WindowClient
const linkerClient = FSBL.Clients.LinkerClient
const loggerClient = FSBL.Clients.Logger
const routerClient = FSBL.Clients.RouterClient
const workspaceClient = FSBL.Clients.WorkspaceClient
const storageClient = FSBL.Clients.StorageClient
const dialogManager = FSBL.Clients.DialogManager
const searchClient = FSBL.Clients.SearchClient

const keyMap = FSBL.Clients.HotkeyClient.keyMap;
var store, test2SpawnResopnse

function openTab(evt, tabName) {
	var i, tabcontent, tablinks;
	tabcontent = document.getElementsByClassName("tabcontent");
	for (i = 0; i < tabcontent.length; i++) {
		tabcontent[i].style.display = "none";
	}
	tablinks = document.getElementsByClassName("tablinks");
	for (i = 0; i < tablinks.length; i++) {
		tablinks[i].className = tablinks[i].className.replace(" active", "");
	}
	document.getElementById(tabName).style.display = "block";
	evt.currentTarget.className += " active";
}

function renderPage() {
	/* Setup dragevent listener for inputbox */
	document.getElementById('symbolInput').addEventListener('dragstart', function (event) {
		var data = {
			'rsrchx.report': {
				symbol: event.target.value
			},
			'symbol': event.target.value
		};
		dragdropClient.dragStartWithData(event, data);
	})

	routerClient.onReady(function () {
		console.log('RouterClient is ready')
	})

	/* Global hotkey button */
	var registerGlobalHotKey = $("<registerGlobalHotKey>Register Global Ctrl+Q</registerGlobalHotKey>");
	registerGlobalHotKey.click(function () {
		registerGlobalHotkey();
	});
	$("#Hotkeys").append(registerGlobalHotKey);

	var unregisterGlobalHotKey = $("<unregisterGlobalHotKey>Unregister Global Ctrl+Q</unregisterGlobalHotKey>");
	unregisterGlobalHotKey.click(function () {
		unregisterGlobalHotkey();
	});
	$("#Hotkeys").append(unregisterGlobalHotKey);

	/* Local hotkey button */
	var registerLocalHotKey = $("<registerLocalHotKey>Register Local Ctrl+Q</registerLocalHotKey>");
	registerLocalHotKey.click(function () {
		registerLocalHotkey();
	});
	$("#Hotkeys").append(registerLocalHotKey);

	var unregisterLocalHotKey = $("<unregisterLocalHotKey>Unregister Local Ctrl+Q</unregisterLocalHotKey>");
	unregisterLocalHotKey.click(function () {
		unregisterLocalHotkey();
	});
	$("#Hotkeys").append(unregisterLocalHotKey);

	/* Notification buttons */
	var notification = $("<notification>Trigger Notification</notification>");
	notification.click(function () {
		triggerNotification();
	});
	$("#Notification").append(notification);

	/* LauncherClient buttons */
	var getActiveDescriptors = $("<getActiveDescriptors>Get Active Descriptor</getActiveDescriptors>");
	getActiveDescriptors.click(function () {
		triggerGetActiveDescriptors();
	});
	$("#Launcher").append(getActiveDescriptors);
	var getComponentDefaultConfig = $("<getComponentDefaultConfig>Get Component Default Config</getComponentDefaultConfig>");
	getComponentDefaultConfig.click(function () {
		triggerGetComponentDefaultConfig();
	});
	$("#Launcher").append(getComponentDefaultConfig);
	var getComponentList = $("<getComponentList>Get Component List</getComponentList>");
	getComponentList.click(function () {
		triggerGetComponentList();
	});
	$("#Launcher").append(getComponentList);
	var getComponentsThatCanReceiveDataTypes = $("<getComponentsThatCanReceiveDataTypes>Get Components That Can Receive Data Types</getComponentsThatCanReceiveDataTypes>");
	getComponentsThatCanReceiveDataTypes.click(function () {
		triggerGetComponentsThatCanReceiveDataTypes();
	});
	$("#Launcher").append(getComponentsThatCanReceiveDataTypes);
	var getMonitorInfo = $("<getMonitorInfo>Get Monitor Info</getMonitorInfo>");
	getMonitorInfo.click(function () {
		triggerGetMonitorInfo();
	});
	$("#Launcher").append(getMonitorInfo);
	var getMonitorInfoAll = $("<getMonitorInfoAll>Get Monitor Info All</getMonitorInfoAll>");
	getMonitorInfoAll.click(function () {
		triggerGetMonitorInfoAll();
	});
	$("#Launcher").append(getMonitorInfoAll);
	var getMyWindowIdentifier = $("<getMyWindowIdentifier>Get My Window Identifer</getMyWindowIdentifier>");
	getMyWindowIdentifier.click(function () {
		triggerGetMyWindowIdentifier();
	});
	$("#Launcher").append(getMyWindowIdentifier);
	var registerComponent = $("<registerComponent>Register Component</registerComponent>");
	registerComponent.click(function () {
		triggerRegisterComponent();
	});
	$("#Launcher").append(registerComponent);
	var unregisterComponent = $("<unregisterComponent>Unregister Component</unregisterComponent>");
	unregisterComponent.click(function () {
		triggerUnregisterComponent();
	});
	$("#Launcher").append(unregisterComponent);
	var spawnComponent = $("<spawnComponent>Spawn Component</spawnComponent>");
	spawnComponent.click(function () {
		triggerSpawnComponent();
	});
	$("#Launcher").append(spawnComponent);
	var showWindow = $("<showWindow>Show Window</showWindow>");
	showWindow.click(function () {
		triggerShowWindow();
	});
	$("#Launcher").append(showWindow);

	/* Linker Client buttons */
	var getAllChannels = $("<getAllChannels>Get All Channels</getAllChannels>");
	getAllChannels.click(function () {
		triggerGetAllChannels();
	});
	$("#Linker").append(getAllChannels);
	var getComLinkedGroup1 = $("<getComLinkedGroup1>Get Components Linked with Group1</getComLinkedGroup1>");
	getComLinkedGroup1.click(function () {
		triggerGetComLinkedGroup1();
	});
	$("#Linker").append(getComLinkedGroup1);
	var getComLinkedCurWindow = $("<getComLinkedCurWindow>Get Components Linked with Current window</getComLinkedCurWindow>");
	getComLinkedCurWindow.click(function () {
		triggerGetComLinkedCurWindow();
	});
	$("#Linker").append(getComLinkedCurWindow);
	var getWinLinkedGroup1 = $("<getWinLinkedGroup1>Get Windows Linked with Group1</getWinLinkedGroup1>");
	getWinLinkedGroup1.click(function () {
		triggerGetWinLinkedGroup1();
	});
	$("#Linker").append(getWinLinkedGroup1);
	var getWinLinkedCurWindow = $("<getWinLinkedCurWindow>Get Windows Linked with Current window</getWinLinkedCurWindow>");
	getWinLinkedCurWindow.click(function () {
		triggerGetWinLinkedCurWindow();
	});
	$("#Linker").append(getWinLinkedCurWindow);
	var getState = $("<getState>Get State of Current window</getState>");
	getState.click(function () {
		triggerGetState();
	});
	$("#Linker").append(getState);
	var linkToGroup1 = $("<linkToGroup1>Link to Group1</linkToGroup1>");
	linkToGroup1.click(function () {
		triggerLinkToGroup1();
	});
	$("#Linker").append(linkToGroup1);
	var unlinkToGroup1 = $("<unlinkToGroup1>Unlink to Group1</unlinkToGroup1>");
	unlinkToGroup1.click(function () {
		triggerUnlinkToGroup1();
	});
	$("#Linker").append(unlinkToGroup1);
	var startOnStateChange = $("<startOnStateChange>Start on state change</startOnStateChange>");
	startOnStateChange.click(function () {
		triggerStartOnStateChange();
	});
	$("#Linker").append(startOnStateChange);
	var openLinkerWindow = $("<openLinkerWindow>Open Linker Window</openLinkerWindow>");
	openLinkerWindow.click(function () {
		triggerOpenLinkerWindow();
	});
	$("#Linker").append(openLinkerWindow);
	var linkerPub = $("<linkerPub>Linker Publish</linkerPub>");
	linkerPub.click(function () {
		triggerLinkerPub();
	});
	$("#Linker").append(linkerPub);

	/* Logger Client buttons */
	var debug = $("<debug>Debug</debug>");
	debug.click(function () {
		triggerDebug();
	});
	$("#Logger").append(debug);
	var error = $("<error>Error</error>");
	error.click(function () {
		triggerError();
	});
	$("#Logger").append(error);
	var info = $("<info>Info</info>");
	info.click(function () {
		triggerInfo();
	});
	$("#Logger").append(info);
	var log = $("<log>Log</log>");
	log.click(function () {
		triggerLog();
	});
	$("#Logger").append(log);
	var verbose = $("<verbose>Verbose</verbose>");
	verbose.click(function () {
		triggerVerbose();
	});
	$("#Logger").append(verbose);
	var warn = $("<warn>Warn</warn>");
	warn.click(function () {
		triggerWarn();
	});
	$("#Logger").append(warn);

	/* Router client buttons */
	var addPubSubResponder = $("<addPubSubResponder>Add Pub Sub Responder</addPubSubResponder>");
	addPubSubResponder.click(function () {
		triggerAddPubSubResponder();
	});
	$("#Router").append(addPubSubResponder);
	var removePubSubResponder = $("<removePubSubResponder>Remove Pub Sub Responder</removePubSubResponder>");
	removePubSubResponder.click(function () {
		triggerRemovePubSubResponder();
	});
	$("#Router").append(removePubSubResponder);
	var publish = $("<publish>Publish</publish>");
	publish.click(function () {
		triggerPublish();
	});
	$("#Router").append(publish);
	var query = $("<query>Query</query>");
	query.click(function () {
		triggerQuery();
	});
	$("#Router").append(query);
	var transmit = $("<transmit>Transmit</transmit>");
	transmit.click(function () {
		triggerTransmit();
	});
	$("#Router").append(transmit);
	var disconnectAll = $("<disconnectAll>Disconnect all</disconnectAll>");
	disconnectAll.click(function () {
		triggerDisconnectAll();
	});
	$("#Router").append(disconnectAll);

	/* Workspace client buttons */
	var autoArrange = $("<autoArrange>Auto Arrange</autoArrange>");
	autoArrange.click(function () {
		triggerAutoArrange();
	});
	$("#Workspace").append(autoArrange);
	var bringWinsToFront = $("<bringWinsToFront>Bring Windows To Front</bringWinsToFront>");
	bringWinsToFront.click(function () {
		triggerBringWinsToFront();
	});
	$("#Workspace").append(bringWinsToFront);
	var createWorkspace = $("<createWorkspace>Create Workspace</createWorkspace>");
	createWorkspace.click(function () {
		triggerCreateWorkspace();
	});
	$("#Workspace").append(createWorkspace);
	var exportWorkspace = $("<exportWorkspace>Export Workspace</exportWorkspace>");
	exportWorkspace.click(function () {
		triggerExportWorkspace();
	});
	$("#Workspace").append(exportWorkspace);
	var getActiveWorkspace = $("<getActiveWorkspace>Get Active Workspace</getActiveWorkspace>");
	getActiveWorkspace.click(function () {
		triggerGetActiveWorkspace();
	});
	$("#Workspace").append(getActiveWorkspace);
	var getWorkspaces = $("<getWorkspaces>Get Workspaces</getWorkspaces>");
	getWorkspaces.click(function () {
		triggerGetWorkspaces();
	});
	$("#Workspace").append(getWorkspaces);
	var importWorkspace = $("<importWorkspace>Import Workspace</importWorkspace>");
	importWorkspace.click(function () {
		triggerImportWorkspace();
	});
	$("#Workspace").append(importWorkspace);
	var minimizeAll = $("<minimizeAll>Minimize All</minimizeAll>");
	minimizeAll.click(function () {
		triggerMinimizeAll();
	});
	$("#Workspace").append(minimizeAll);
	var removeWorkspace = $("<removeWorkspace>Remove Workspace</removeWorkspace>");
	removeWorkspace.click(function () {
		triggerRemoveWorkspace();
	});
	$("#Workspace").append(removeWorkspace);
	var renameWorkspace = $("<renameWorkspace>Rename Workspace</renameWorkspace>");
	renameWorkspace.click(function () {
		triggerRenameWorkspace();
	});
	$("#Workspace").append(renameWorkspace);
	var saveWorkspace = $("<saveWorkspace>Save Workspace</saveWorkspace>");
	saveWorkspace.click(function () {
		triggerSaveWorkspace();
	});
	$("#Workspace").append(saveWorkspace);
	var saveAsWorkspace = $("<saveAsWorkspace>Save As Workspace</saveAsWorkspace>");
	saveAsWorkspace.click(function () {
		triggerSaveAsWorkspace();
	});
	$("#Workspace").append(saveAsWorkspace);
	var switchToWorkspace = $("<switchToWorkspace>Switch To Workspace</switchToWorkspace>");
	switchToWorkspace.click(function () {
		triggerSwitchToWorkspace();
	});
	$("#Workspace").append(switchToWorkspace);

	/* DistributedStore Client buttons*/
	var createStore = $("<createStore>Create Store</createStore>");
	createStore.click(function () {
		triggerCreateStore();
	});
	$("#DistributedStore").append(createStore);
	var getStore = $("<getStore>Get Store</getStore>");
	getStore.click(function () {
		triggerGetStore();
	});
	$("#DistributedStore").append(getStore);
	var removeStore = $("<removeStore>Remove Store</removeStore>");
	removeStore.click(function () {
		triggerRemoveStore();
	});
	$("#DistributedStore").append(removeStore);

	var getStoreValue = $("<getStoreValue>Get Store Value</getStoreValue>");
	getStoreValue.click(function () {
		triggerGetStoreValue();
	});
	$("#DistributedStore").append(getStoreValue);
	var setStoreValue1 = $("<setStoreValue1>Set Store Value field1</setStoreValue1>");
	setStoreValue1.click(function () {
		triggerSetStoreValue('field1');
	});
	$("#DistributedStore").append(setStoreValue1);
	var setStoreValue2 = $("<setStoreValue2>Set Store Value field2</setStoreValue2>");
	setStoreValue2.click(function () {
		triggerSetStoreValue('field2');
	});
	$("#DistributedStore").append(setStoreValue2);

	/* Storage client buttons */
	var setStorageUser = $("<setStorageUser>Set User</setStorageUser>");
	setStorageUser.click(function () {
		triggerSetStorageUser();
	});
	$("#Storage").append(setStorageUser);
	var setStorageStore = $("<setStorageStore>Set Store</setStorageStore>");
	setStorageStore.click(function () {
		triggerSetStorageStore();
	});
	$("#Storage").append(setStorageStore);
	var saveStorageValue = $("<saveStorageValue>Save Value</saveStorageValue>");
	saveStorageValue.click(function () {
		triggerSaveStorageValue();
	});
	$("#Storage").append(saveStorageValue);
	var getStorageValue = $("<getStorageValue>Get Storage Value</getStorageValue>");
	getStorageValue.click(function () {
		triggerGetStorageValue();
	});
	$("#Storage").append(getStorageValue);
	var removeStorageValue = $("<removeStorageValue>Remove Value</removeStorageValue>");
	removeStorageValue.click(function () {
		triggerRemoveStorageValue();
	});
	$("#Storage").append(removeStorageValue);
	var getStorageKeys = $("<getStorageKeys>Get Storage Keys</getStorageKeys>");
	getStorageKeys.click(function () {
		triggerGetStorageKeys();
	});
	$("#Storage").append(getStorageKeys);

	/* WindowClient buttons */
	var bringWindowToFront = $("<bringWindowToFront>Bring Windows To Front</bringWindowToFront>");
	bringWindowToFront.click(function () {
		triggerBringWindowToFront();
	});
	$("#Windows").append(bringWindowToFront);
	var cancelTilingOrTabbing = $("<cancelTilingOrTabbing>Cancel Tiling or Tabbing</cancelTilingOrTabbing>");
	cancelTilingOrTabbing.click(function () {
		triggerCancelTilingOrTabbing();
	});
	$("#Windows").append(cancelTilingOrTabbing);
	var closeWindow = $("<closeWindow>Close Window</closeWindow>");
	closeWindow.click(function () {
		triggerCloseWindow();
	});
	$("#Windows").append(closeWindow);
	var fitToDom = $("<fitToDom>Fit to Dom</fitToDom>");
	fitToDom.click(function () {
		triggerFitToDom();
	});
	$("#Windows").append(fitToDom);
	var getBounds = $("<getBounds>Get Bounds</getBounds>");
	getBounds.click(function () {
		triggerGetBounds();
	});
	$("#Windows").append(getBounds);

	var setComponentState = $("<setComponentState>Set Component State</setComponentState>");
	setComponentState.click(function () {
		triggerSetComponentState();
	});
	$("#Windows").append(setComponentState);
	var removeComponentState = $("<removeComponentState>Remove Component State</removeComponentState>");
	removeComponentState.click(function () {
		triggerRemoveComponentState();
	});
	$("#Windows").append(removeComponentState);
	var getComponentState = $("<getComponentState>Get Component State</getComponentState>");
	getComponentState.click(function () {
		triggerGetComponentState();
	});
	$("#Windows").append(getComponentState);
	var getCurWin = $("<getCurWin>Get Current Window</getCurWin>");
	getCurWin.click(function () {
		triggerGetCurWin();
	});
	$("#Windows").append(getCurWin);
	var getSpawnData = $("<getSpawnData>Get Spawn Data</getSpawnData>");
	getSpawnData.click(function () {
		triggerGetSpawnData();
	});
	$("#Windows").append(getSpawnData);
	var getStackedWindow = $("<getStackedWindow>Get Stacked Window</getStackedWindow>");
	getStackedWindow.click(function () {
		triggerGetStackedWindow();
	});
	$("#Windows").append(getStackedWindow);
	var getWindowsGroup = $("<getWindowsGroup>Get Window Groups</getWindowsGroup>");
	getWindowsGroup.click(function () {
		triggerGetWindowsGroup();
	});
	$("#Windows").append(getWindowsGroup);
	var getWindowIdentifier = $("<getWindowIdentifier>Get Window Identifier</getWindowIdentifier>");
	getWindowIdentifier.click(function () {
		triggerGetWindowIdentifier();
	});
	$("#Windows").append(getWindowIdentifier);
	var getWindowNameForDocking = $("<getWindowNameForDocking>Get Window Name For Docking</getWindowNameForDocking>");
	getWindowNameForDocking.click(function () {
		triggerGetWindowNameForDocking();
	});
	$("#Windows").append(getWindowNameForDocking);
	var getWindowTitle = $("<getWindowTitle>Get Window Title</getWindowTitle>");
	getWindowTitle.click(function () {
		triggerGetWindowTitle();
	});
	$("#Windows").append(getWindowTitle);
	var estHeaderCommandChannel = $("<estHeaderCommandChannel>Establish Header Command Channel</estHeaderCommandChannel>");
	estHeaderCommandChannel.click(function () {
		triggerEstHeaderCommandChannel();
	});
	$("#Windows").append(estHeaderCommandChannel);
	var injectHeader = $("<injectHeader>Inject Header</injectHeader>");
	injectHeader.click(function () {
		triggerInjectHeader();
	});
	$("#Windows").append(injectHeader);
	var maximize = $("<maximize>Maximize</maximize>");
	maximize.click(function () {
		triggerMaximize();
	});
	$("#Windows").append(maximize);
	var minimize = $("<minimize>Minimize</minimize>");
	minimize.click(function () {
		triggerMinimize();
	});
	$("#Windows").append(minimize);
	var restore = $("<restore>Restore</restore>");
	restore.click(function () {
		triggerRestore();
	});
	$("#Windows").append(restore);
	var sendWinIdentifierForTilingOrTabbing = $("<sendWinIdentifierForTilingOrTabbing>Send Window Identifier For Tiling or Tabbing</sendWinIdentifierForTilingOrTabbing>");
	sendWinIdentifierForTilingOrTabbing.click(function () {
		triggerSendWinIdentifierForTilingOrTabbing();
	});
	$("#Windows").append(sendWinIdentifierForTilingOrTabbing);
	var setAlwaysOnTop = $("<setAlwaysOnTop>Set Always On Top</setAlwaysOnTop>");
	setAlwaysOnTop.click(function () {
		triggerSetAlwaysOnTop();
	});
	$("#Windows").append(setAlwaysOnTop);
	var setWindowTitle = $("<setWindowTitle>Set Window Title</setWindowTitle>");
	setWindowTitle.click(function () {
		triggerSetWindowTitle();
	});
	$("#Windows").append(setWindowTitle);
	var showAtMousePos = $("<showAtMousePos>Show At Mouse Position</setWindowTshowAtMousePositle>");
	showAtMousePos.click(function () {
		triggerShowAtMousePos();
	});
	$("#Windows").append(showAtMousePos);
	var startTilingOrTabbing = $("<startTilingOrTabbing>Start Tiling Or Tabbing</startTilingOrTabbing>");
	startTilingOrTabbing.click(function () {
		triggerStartTilingOrTabbing();
	});
	$("#Windows").append(startTilingOrTabbing);
	var stopTilingOrTabbing = $("<stopTilingOrTabbing>Stop Tiling Or Tabbing</stopTilingOrTabbing>");
	stopTilingOrTabbing.click(function () {
		triggerStopTilingOrTabbing();
	});
	$("#Windows").append(stopTilingOrTabbing);

	/* Dialog Buttons */
	var openDialog = $("<openDialog>Open Dialog</openDialog>");
	openDialog.click(function () {
		triggerOpenDialog();
	});
	$("#Dialog").append(openDialog);

	/* Search Client Buttons */
	var search = $("<search>search</search>");
	search.click(function () {
		triggerSearch();
	});
	$("#Search").append(search);
}
/* SeachClient Functions*/
function triggerSearch() {
	if (document.getElementById('symbolInput').value != '')
		searchClient.search({
			text: document.getElementById('symbolInput').value
		}, function (err, response) {
			if (!err) {
				alert('Sussceed. See console for detail.')
				console.log(response)
			}
		})
	else
		alert('Input a value.')
}

/* Dialog manager functions */
function triggerOpenDialog() {
	let self = this;
	let dialogParams = {
		question: 'Test Question. See response in console.',
		affirmativeResponseText: 'Yes, overwrite',
		negativeResponseText: 'No, cancel',
		includeNegative: true,
		includeCancel: false
	};
	dialogManager.open('yesNo', dialogParams, function (err, response) {
		//choice can be `'affirmative'`, `'negative'`, or `'cancel'`.
		console.log("Response Received: " + response.choice)
		if (err || response.choice === 'affirmative') {
			//alert("Response Received: "+response.choice)
		}
	});
}

/* WindowClient functions */
function triggerStopTilingOrTabbing() {
	var windowIdentifier = windowClient.getWindowIdentifier()
	windowClient.startTilingOrTabbing({
		windowIdentifier: windowIdentifier
	}, function (err) {
		if (!err) {
			alert('Stopped')
		}
	})
}

function triggerStartTilingOrTabbing() {
	var windowIdentifier = windowClient.getWindowIdentifier()
	windowClient.startTilingOrTabbing({
		mousePosition: {
			x: 100,
			y: 100
		}
	}, function (err) {
		if (!err) {
			alert('Started')
		}
	})
}

function triggerShowAtMousePos() {
	windowClient.showAtMousePosition()
}

function triggerSetWindowTitle() {
	if (document.getElementById('symbolInput').value != '')
		windowClient.setWindowTitle(document.getElementById('symbolInput').value)
	else
		alert('Input a value.')
}

function triggerSetAlwaysOnTop() {
	windowClient.setAlwaysOnTop(true, function (err) {
		if (!err) {
			alert('Sussceed.')
		}
	})
}

function triggerSendWinIdentifierForTilingOrTabbing() {
	var windowIdentifier = windowClient.getWindowIdentifier()
	windowClient.sendIdentifierForTilingOrTabbing({
		windowIdentifier: windowIdentifier
	}, function (err) {
		if (!err) {
			alert('Sussceed.')
		}
	})
}

function triggerRestore() {
	windowClient.restore(function (err) {
		if (!err) {}
	})
}

function triggerRemoveComponentState() {
	windowClient.removeComponentState({
		fields: [{
			field: 'testField1'
		}, {
			field: 'testField2'
		}]
	}, function (err) {
		if (!err) {
			alert('Sussceed.')
		}
	})
}

function triggerMinimize() {
	windowClient.minimize(function (err) {
		if (!err) {}

	})
}

function triggerMaximize() {
	windowClient.maximize(function (err) {
		if (!err) {}

	})
}

function triggerInjectHeader() {
	windowClient.injectHeader({}, function (err) {

	})
}

function triggerEstHeaderCommandChannel() {
	windowClient.headerCommandChannel(function (err, header) {
		console.log(header)
	})
}

function triggerGetWindowTitle() {
	var windowTitle = windowClient.getWindowTitle()
	if (windowTitle)
		alert('Sussceed. Window Title: ' + windowTitle)
}

function triggerGetWindowNameForDocking() {
	var windowName = windowClient.getWindowNameForDocking()
	if (windowName) {
		alert('Sussceed. Window Name: ' + windowName)
	}
}

function triggerGetWindowIdentifier() {
	var windowIdentifier = windowClient.getWindowIdentifier()
	if (windowIdentifier) {
		alert('Sussceed. See console for detail.')
		console.log(windowIdentifier)
	}
}

function triggerGetWindowsGroup() {
	var windowGroups = windowClient.getWindowGroups()
	if (windowGroups) {
		alert('Sussceed. See console for detail.')
		console.log(windowGroups)
	}
}

function triggerGetStackedWindow() {
	windowClient.getStackedWindow({}, function (err, stackedWindow) {
		if (!err) {
			console.log(stackedWindow)
		}
	})
}

function triggerGetSpawnData() {
	var spawnData = windowClient.getSpawnData()
	if (spawnData) {
		alert('Sussceed. See console for detail.')
		console.log(spawnData)
	}
}

function triggerGetCurWin() {
	var currentWindow = windowClient.getCurrentWindow()
	if (currentWindow) {
		alert('Sussceed. See console for detail.')
		console.log(currentWindow)
	}
}

function triggerSetComponentState() {
	if (document.getElementById('symbolInput').value != '')
		windowClient.setComponentState({
				fields: [{
					field: 'testField1',
					value: document.getElementById('symbolInput').value
				}, {
					field: 'testField2',
					value: document.getElementById('symbolInput').value
				}]
			},
			function (err) {
				if (!err) {
					alert('Sussceed.')
				}
			})
	else
		alert('Input a value.')
}

function triggerGetComponentState() {
	windowClient.getComponentState({}, function (err, state) {
		if (!err) {
			alert('Sussceed. See console for detail.')
			console.log(state)
		}
	})
}

function triggerGetBounds() {
	windowClient.getBounds(function (err, bounds) {
		if (!err) {
			alert('Sussceed. See console for detail.')
			console.log(bounds)
		}
	})
}

function triggerFitToDom() {
	windowClient.fitToDOM({
		maxHeight: 300,
		maxWidth: 300,
		padding: {
			height: 100,
			wdith: 100
		}
	}, function (err) {
		if (!err) {}
	})
}

function triggerCloseWindow() {
	windowClient.close(false);
}

function triggerCancelTilingOrTabbing() {
	windowClient.cancelTilingOrTabbing({
		windowIdentifier: windowClient.getWindowIdentifier()
	}, function (err) {
		if (!err) {
			alert('Sussceed.')
		}
	})
}

function triggerBringWindowToFront() {
	windowClient.bringWindowToFront()
}

/* Storage client functions */
function triggerGetStorageValue() {
	storageClient.get({
		topic: "finsemble",
		key: "testKey"
	}, function (err, val) {
		if (!err) {
			alert('Topic: finsemble, Key: testKey, value: ' + val)
		}
	})
}

function triggerGetStorageKeys() {
	storageClient.keys({
		topic: "finsemble"
	}, function (err, keys) {
		if (!err) {
			alert('Successed. Check console for detail.')
			console.log(keys)
		}
	})
}

function triggerRemoveStorageValue() {
	storageClient.remove({
		topic: "finsemble",
		key: "testKey"
	}, function (err) {
		if (!err)
			alert('Sussceed. Check console for detail.')
	})
}

function triggerSaveStorageValue() {
	if (document.getElementById('symbolInput').value != '')
		storageClient.save({
			topic: "finsemble",
			key: "testKey",
			value: document.getElementById('symbolInput').value
		}, function (err) {
			if (!err)
				alert('Sussceed. Check console for detail.')
		})
	else
		alert('Input a value.')
}

function triggerSetStorageStore() {
	storageClient.setStore({
		topic: "local",
		dataStore: "LocalStorageAdapter"
	}, function (err) {
		if (!err)
			alert('Sussceed. Check console for detail.')
	})
}

function triggerSetStorageUser() {
	storageClient.setUser({
		user: 'testUser'
	}, function (err) {
		if (!err)
			alert('Sussceed. Check console for detail.')
	})
}

/* Distributed store client functions */
function triggerSetStoreValue(field) {
	distributedStoreClient.getStore({
		store: 'testDs1',
	}, function (err, store) {
		if (!err) {
			store.setValue({
				field: field,
				value: document.getElementById('symbolInput').value
			}, function (err) {})
		} else
			alert('No such store.')
	})
}

function triggerGetStoreValue() {
	distributedStoreClient.getStore({
		store: 'testDs1',
	}, function (err, store) {
		if (!err) {
			store.getValue({
				field: 'field1'
			}, function (err, value) {
				alert('Field1: ' + value)
			})
		} else
			alert('No such store.')
	})
}

function triggerRemoveStore() {
	distributedStoreClient.removeStore({
		store: 'testDs1',
	}, function (err) {
		if (!err) {
			alert('testDs1 removed.')
		} else
			alert('No such store.')
	})
}

function triggerGetStore() {
	distributedStoreClient.getStore({
		store: 'testDs1',
	}, function (err, store) {
		if (!err) {
			alert('Sussceed. Check console.log for store object detail.')
			console.log(store)
		} else
			alert('No such store.')
	})
}

function triggerCreateStore() {
	distributedStoreClient.createStore({
		store: 'testDs1',
		global: true,
		values: {
			field1: 'testdata1',
			field2: 'testdata2'
		}
	}, function (err, store) {
		if (!err) {
			alert('testDs1 created. See console for store detail')
			console.log(store)
		}
	})
}

/* Workspace client functions */
function triggerSwitchToWorkspace() {
	if (document.getElementById('symbolInput').value != '')
		workspaceClient.switchTo({
			name: document.getElementById('symbolInput').value
		}, function (err, response) {
			if (!err) {
				alert('Switched.')
			}
		})
	else
		alert('Input a name.')
}

function triggerSaveAsWorkspace() {
	if (document.getElementById('symbolInput').value != '')
		workspaceClient.saveAs({
			name: document.getElementById('symbolInput').value
		}, function (err, response) {
			if (!err) {
				alert('Saved.')
			}
		})
	else
		alert('Input a name.')
}

function triggerSaveWorkspace() {
	workspaceClient.save(function (err, response) {
		if (!err) {
			alert('Saved.')
		}
	})
}

function triggerRenameWorkspace() {
	if (document.getElementById('symbolInput').value != '')
		workspaceClient.getActiveWorkspace(function (err, response) {
			if (!err) {
				workspaceClient.rename({
					oldName: response.data.name,
					newName: document.getElementById('symbolInput').value
				}, function (err, response) {
					if (!err) {
						alert('Sussceed')
					}
				})
			}
		})
	else
		alert('Input a name')
}

function triggerRemoveWorkspace() {
	if (document.getElementById('symbolInput').value != '')
		workspaceClient.remove({
			name: document.getElementById('symbolInput').value
		}, function (err, response) {
			if (!err) {
				alert('Sussceed.')
			} else {
				alert('Workspace not found.')
			}
		})
	else
		alert('Input a name')
}

function triggerMinimizeAll() {
	workspaceClient.minimizeAll({}, function (err) {
		if (!err) {}
	})
}


function triggerImportWorkspace() {
	workspaceClient.getActiveWorkspace(function (err, response) {
		if (!err) {
			workspaceClient.export({
				workspaceName: response.data.name
			}, function (err, workspaceDefinition) {
				if (!err) {
					workspaceClient.import({
						force: false,
						workspaceJSONDefinition: workspaceDefinition
					}, function (err) {
						if (!err)
							alert('Sussceed.')
					})
				}
			})
		}
	})
}

function triggerGetWorkspaces() {
	workspaceClient.getWorkspaces(function (err, response) {
		if (!err) {
			console.log(response)
			alert('Sussceed. See console for detail')
		}
	})
}

function triggerGetActiveWorkspace() {
	workspaceClient.getActiveWorkspace(function (err, response) {
		if (!err) {
			console.log(response)
			alert('Sussceed. See console for detail')
		}
	})
}

function triggerExportWorkspace() {
	if (document.getElementById('symbolInput').value != '')
		workspaceClient.export({
			workspaceName: document.getElementById('symbolInput').value
		}, function (err, workspaceDefinition) {
			if (!err) {
				console.log(workspaceDefinition)
				alert('Workspace definition exported. See console for detail')
			}
		})
	else
		alert('Input a name')
}

function triggerCreateWorkspace() {
	if (document.getElementById('symbolInput').value != '')
		workspaceClient.createWorkspace(document.getElementById('symbolInput').value, {}, function (err, response) {
			if (!err) {

			}
		})
	else
		alert('Input a name!')
}

function triggerBringWinsToFront() {
	workspaceClient.bringWindowsToFront({}, function () {

	})
}

function triggerAutoArrange() {
	workspaceClient.autoArrange({}, function () {

	})
}

/* Router client functions */
function triggerDisconnectAll() {
	routerClient.disconnectAll()
	alert('Disconnected all.')
}

function triggerTransmit() {
	routerClient.transmit('symbol', {
		'data': document.getElementById('symbolInput').value
	})
}

function triggerQuery() {
	routerClient.query("symbol", {
		queryKey: "abc123"
	}, {
		timeout: 1000
	}, function (error, queryResponseMessage) {
		if (!error) {
			// process income query response message
			alert("Router client query respond: " + queryResponseMessage.data)
		}
	});
}

function triggerPublish() {
	routerClient.publish('symbol', {
		'symbol': document.getElementById('symbolInput').value
	})
}

function triggerRemovePubSubResponder() {
	routerClient.removePubSubResponder('symbol')
}

function triggerAddPubSubResponder() {
	routerClient.addPubSubResponder("symbol", {
		"State": "start"
	}, {
		subscribeCallback: subscribeCallback,
		publishCallback: publishCallback,
		unsubscribeCallback: unsubscribeCallback
	});
	alert("Pubsub responder added.")
}

function subscribeCallback(error, subscribe) {
	if (subscribe) {
		// must make this callback to accept or reject the subscribe (default is to accept). First parm is err and second is the initial state
		alert(subscribe.header.origin + ' subscribed topic ' + subscribe.header.topic)
		subscribe.sendNotifyToSubscriber(null, {
			"NOTIFICATION-STATE": "One"
		});
	}
}

function publishCallback(error, publish) {
	if (publish) {
		// must make this callback to send notify to all subscribers (if error parameter set then notify will not be sent)
		publish.sendNotifyToAllSubscribers(null, publish.data);
	}
}

function unsubscribeCallback(error, unsubscribe) {
	if (unsubscribe) {
		// must make this callback to acknowledge the unsubscribe
		alert(unsubscribe.header.origin + ' unsubscribed topic ' + unsubscribe.header.topic)
		unsubscribe.removeSubscriber();
	}
}

/* Logger client functions */
function triggerWarn() {
	loggerClient.warn('This is a warn message')
}

function triggerVerbose() {
	loggerClient.verbose('This is a verbose message')
}

function triggerLog() {
	loggerClient.log('This is a log message')
}

function triggerInfo() {
	loggerClient.info('This an info message')
}

function triggerError() {
	loggerClient.error('This is an error message')
}

function triggerDebug() {
	loggerClient.debug('This is a debug message')
}

/* Linker client functions */
function triggerLinkerPub() {
	linkerClient.publish({
		dataType: "symbol",
		data: document.getElementById('symbolInput').value
	}, function (err) {
		if (!err) {
			//alert('Publish sussceed.')
		}
	})
}

function triggerOpenLinkerWindow() {
	linkerClient.openLinkerWindow(function (err, response) {
		if (!err) {
			console.log(response)
		}
	})
}

function triggerStartOnStateChange() {
	linkerClient.onStateChange(function (err, response) {
		if (!err) {
			alert("Linker state changed. See console for detail.")
			console.log(response)
		}
	})
}

function triggerLinkToGroup1() {
	linkerClient.linkToChannel("group1", null, function (err, channel) {
		if (!err) {
			alert('Link to group1 succeed. See console for detail')
			console.log(channel)
		}
	})
}

function triggerUnlinkToGroup1() {
	linkerClient.unlinkFromChannel("group1", null, function (err, channel) {
		if (!err) {
			alert('Unlink to group1 succeed. See console for detail')
			console.log(channel)
		}
	})
}

function triggerGetState() {
	linkerClient.getState(windowClient.getWindowIdentifier, function (err, state) {
		if (!err) {
			alert('Get state succeed. See console for detail')
			console.log(state)
		}
	})
}

function triggerGetWinLinkedCurWindow() {
	linkerClient.getLinkedWindows(windowClient.getWindowIdentifier, function (err, windows) {
		if (!err) {
			alert(windows.length + ' windows linked with current component. See console for detail.')
			console.log(windows)
		}
	})
}

function triggerGetWinLinkedGroup1() {
	linkerClient.getLinkedWindows({
		channels: ['group1']
	}, function (err, windows) {
		if (!err) {
			alert(windows.length + ' windows linked with Group1. See console for detail.')
			console.log(windows)
		}
	})
}

function triggerGetComLinkedCurWindow() {
	linkerClient.getLinkedComponents(windowClient.getWindowIdentifier, function (err, components) {
		if (!err) {
			alert(components.length + ' components linked with current component. See console for detail.')
			console.log(components)
		}
	})
}

function triggerGetComLinkedGroup1() {
	linkerClient.getLinkedComponents({
		channels: ['group1']
	}, function (err, components) {
		if (!err) {
			alert(components.length + ' components linked with Group1. See console for detail.')
			console.log(components)
		}
	})
}

function triggerGetAllChannels() {
	linkerClient.getAllChannels(function (err, channels) {
		if (!err) {
			alert(channels.length + ' Linker channels found. See console for detail.')
			console.log(channels)
		}
	})
}


/* Launcher client functions */
function triggerGetActiveDescriptors() {
	launcherClient.getActiveDescriptors(function (err, desc) {
		if (!err) {
			console.log(desc)
			alert('There are ' + Object.keys(desc).length + ' window descriptors. See console for detail.')
		}
	})
}

function triggerGetComponentDefaultConfig() {
	launcherClient.getComponentDefaultConfig('test1', function (err, config) {
		if (!err) {
			console.log(config)
			alert('Test1 component found. See console for detail.')
		}
	})
}

function triggerGetComponentList() {
	launcherClient.getComponentList(function (err, componentList) {
		if (!err) {
			console.log(componentList)
			alert('Component list found. See console for detail.')
		}
	})
}

function triggerGetComponentsThatCanReceiveDataTypes() {
	//This function cooperate with field "advertiseReceivers" in component.json which should be deprecated
	launcherClient.getComponentsThatCanReceiveDataTypes({
		dataTypes: ['symbol']
	}, function (err, componentList) {
		if (!err) {
			console.log(componentList)
			alert('Component list found. See console for detail.')
		}
	})
}

function triggerGetMonitorInfo() {
	launcherClient.getMonitorInfo({}, function (err, monitorList) {
		if (!err) {
			console.log(monitorList)
			alert('Monitor list found. See console for detail.')
		}
	})
}

function triggerGetMonitorInfoAll() {
	launcherClient.getMonitorInfoAll(function (err, monitorList) {
		if (!err) {
			console.log(monitorList)
			alert('Monitor list found. See console for detail.')
		}
	})
}

function triggerGetMyWindowIdentifier() {
	//Should the cb able to return 'err'?
	launcherClient.getMyWindowIdentifier(function (windowIdentifer) {
		if (windowIdentifer) {
			console.log(windowIdentifer)
			alert('Window Identifer found. See console for detail.')
		}
	})
}

function triggerRegisterComponent() {
	launcherClient.registerComponent({
		componentType: 'testRegisterComponent',
		manifest: {
			window: {
				url: "https://google.com",
				"width": 800,
				"height": 600
			},
			"foreign": {
				"services": {
					"dockingService": {
						"canGroup": true,
						"isArrangable": true
					}
				},
				"components": {
					"App Launcher": {
						"launchableByUser": true
					},
					"Window Manager": {
						"title": "testRegisterComponent",
						"FSBLHeader": true,
						"persistWindowState": true,
						"showLinker": true
					},
					"Toolbar": {
						"iconClass": "test"
					}
				}
			}
		}
	}, function (err) {
		if (!err) {
			alert("Register Component Succeed.")
		}
	})
}

function triggerUnregisterComponent() {
	launcherClient.unRegisterComponent({
		componentType: 'testRegisterComponent'
	}, function (err) {
		if (!err) {
			alert("Unregister Component Succeed.")
		}
	})
}

function triggerSpawnComponent() {
	launcherClient.spawn('apitest2', {
			addToWorkspace: true,
			left: "adjacent",
			spawnIfNotFound: true,
			data: {}
		},
		function (err, response) {
			if (!err) {
				test2SpawnResopnse = response
			} else
				alert('Spawn error')
		})
}

function triggerShowWindow() {
	var windowIdentifier = {
		componentType: "test2",
		windowName: windowClient.options.name + ".test2"
	};

	launcherClient.showWindow(
		windowIdentifier, {
			addToWorkspace: true,
			left: "adjacent",
			spawnIfNotFound: true,
			data: {}
		},
		function (err, response) {
			if (!err) {
				test2SpawnResopnse = response
			} else {
				alert("Window can only shown once.")
			}
		}
	);
}




/* Global Hotkey functions*/
function registerGlobalHotkey() {
	const keys = [keyMap.ctrl, keyMap.q];
	hotkeyClient.addGlobalHotkey(keys, onGlobalHotkeyTriggered, onGlobalHotkeyRegistered);
}

function unregisterGlobalHotkey() {
	const keys = [keyMap.ctrl, keyMap.q];
	hotkeyClient.removeGlobalHotkey(keys, onGlobalHotkeyTriggered, onGlobalHotkeyUnregistered);
}

function onGlobalHotkeyTriggered(err, response) {
	if (err)
		return console.error(err);
	alert("Pressed Global Ctrl + Q");
}

function onGlobalHotkeyRegistered(err, response) {
	if (err)
		return console.error(err);
	alert("Registered global hotkey Ctrl + Q");
}

function onGlobalHotkeyUnregistered(err, response) {
	if (err)
		return console.error(err);
	alert("Unregistered global hotkey Ctrl + Q");
}

/* Local Hotkey functions*/
function registerLocalHotkey() {
	const keys = [keyMap.ctrl, keyMap.q];
	hotkeyClient.addLocalHotkey(keys, onLocalHotkeyTriggered, onLocalHotkeyRegistered);
}

function onLocalHotkeyTriggered(err, response) {
	if (err)
		return console.error(err);

	alert("Pressed local Ctrl + Q");
}

function onLocalHotkeyRegistered(err, response) {
	if (err)
		return console.error(err);

	alert("Registered local hotkey Ctrl + Q");
}

function unregisterLocalHotkey() {
	const keys = [keyMap.ctrl, keyMap.q];
	hotkeyClient.removeLocalHotkey(keys, onLocalHotkeyTriggered, onLocalHotkeyUnregistered);
}

function onLocalHotkeyUnregistered(err, response) {
	if (err)
		return console.error(err);

	alert("Unregistered local hotkey Ctrl + Q");
}

/* notification */
function triggerNotification() {
	FSBL.UserNotification.alert("system", "ALWAYS", "TEST1", "Test Notification", {
		"duration": 5000
	});
}


function setupEmitter() {
	dragdropClient.setEmitters({
		emitters: [{
			type: "symbol",
			data: getSymbol
		}]
	});
}

function getSymbol() {
	//console.log(document.getElementById('symbolInput').value)
	return document.getElementById('symbolInput').value
}

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", FSBLReady);
} else {
	window.addEventListener("FSBLReady", FSBLReady);
}

function FSBLReady() {
	//alert(FSBL.Clients.WindowClient.options.customData.component["account-type"]); // --> Step 1.4
	renderPage();
	setupEmitter();
	//triggerGetDistributedStoreData()
	//getState(); // --> Step 3.1
	//communicateBetweenComponents(); // --> Step 4.1

}