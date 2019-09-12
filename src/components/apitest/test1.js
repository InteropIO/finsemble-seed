const keyMap = FSBL.Clients.HotkeyClient.keyMap;
var dsStore, test2SpawnResopnse

function renderPage() {
	/* Setup dragevent listener for inputbox */
	document.getElementById('symbolInput').addEventListener('dragstart', function (event) {
		const data = {
			'rsrchx.report': {
				symbol: event.target.value
			},
			'symbol': event.target.value
		};
		FSBL.Clients.DragAndDropClient.dragStartWithData(event, data);
	})

	FSBL.Clients.RouterClient.onReady(function () {
		console.log('RouterClient is ready')
	})

	/* Global hotkey button */
	const registerGlobalHotKey = $("<registerGlobalHotKey>Register Global Ctrl+Q</registerGlobalHotKey>");
	registerGlobalHotKey.click(function () {
		registerGlobalHotkey();
	});
	$("#Hotkeys").append(registerGlobalHotKey);

	const unregisterGlobalHotKey = $("<unregisterGlobalHotKey>Unregister Global Ctrl+Q</unregisterGlobalHotKey>");
	unregisterGlobalHotKey.click(function () {
		unregisterGlobalHotkey();
	});
	$("#Hotkeys").append(unregisterGlobalHotKey);

	/* Local hotkey button */
	const registerLocalHotKey = $("<registerLocalHotKey>Register Local Ctrl+Q</registerLocalHotKey>");
	registerLocalHotKey.click(function () {
		registerLocalHotkey();
	});
	$("#Hotkeys").append(registerLocalHotKey);

	const unregisterLocalHotKey = $("<unregisterLocalHotKey>Unregister Local Ctrl+Q</unregisterLocalHotKey>");
	unregisterLocalHotKey.click(function () {
		unregisterLocalHotkey();
	});
	$("#Hotkeys").append(unregisterLocalHotKey);

	/* Notification buttons */
	const notification = $("<notification>Trigger Notification</notification>");
	notification.click(function () {
		triggerNotification();
	});
	$("#Notification").append(notification);

	/* LauncherClient buttons */
	const getActiveDescriptors = $("<getActiveDescriptors>Get Active Descriptor</getActiveDescriptors>");
	getActiveDescriptors.click(function () {
		triggerGetActiveDescriptors();
	});
	$("#Launcher").append(getActiveDescriptors);
	const getComponentDefaultConfig = $("<getComponentDefaultConfig>Get Component Default Config</getComponentDefaultConfig>");
	getComponentDefaultConfig.click(function () {
		triggerGetComponentDefaultConfig();
	});
	$("#Launcher").append(getComponentDefaultConfig);
	const getComponentList = $("<getComponentList>Get Component List</getComponentList>");
	getComponentList.click(function () {
		triggerGetComponentList();
	});
	$("#Launcher").append(getComponentList);
	const getComponentsThatCanReceiveDataTypes = $("<getComponentsThatCanReceiveDataTypes>Get Components That Can Receive Data Types</getComponentsThatCanReceiveDataTypes>");
	getComponentsThatCanReceiveDataTypes.click(function () {
		triggerGetComponentsThatCanReceiveDataTypes();
	});
	$("#Launcher").append(getComponentsThatCanReceiveDataTypes);
	const getMonitorInfo = $("<getMonitorInfo>Get Monitor Info</getMonitorInfo>");
	getMonitorInfo.click(function () {
		triggerGetMonitorInfo();
	});
	$("#Launcher").append(getMonitorInfo);
	const getMonitorInfoAll = $("<getMonitorInfoAll>Get Monitor Info All</getMonitorInfoAll>");
	getMonitorInfoAll.click(function () {
		triggerGetMonitorInfoAll();
	});
	$("#Launcher").append(getMonitorInfoAll);
	const getMyWindowIdentifier = $("<getMyWindowIdentifier>Get My Window Identifer</getMyWindowIdentifier>");
	getMyWindowIdentifier.click(function () {
		triggerGetMyWindowIdentifier();
	});
	$("#Launcher").append(getMyWindowIdentifier);
	const registerComponent = $("<registerComponent>Register Component</registerComponent>");
	registerComponent.click(function () {
		triggerRegisterComponent();
	});
	$("#Launcher").append(registerComponent);
	const unregisterComponent = $("<unregisterComponent>Unregister Component</unregisterComponent>");
	unregisterComponent.click(function () {
		triggerUnregisterComponent();
	});
	$("#Launcher").append(unregisterComponent);
	const spawnComponent = $("<spawnComponent>Spawn Component</spawnComponent>");
	spawnComponent.click(function () {
		triggerSpawnComponent();
	});
	$("#Launcher").append(spawnComponent);
	const showWindow = $("<showWindow>Show Window</showWindow>");
	showWindow.click(function () {
		triggerShowWindow();
	});
	$("#Launcher").append(showWindow);

	/* Linker Client buttons */
	const getAllChannels = $("<getAllChannels>Get All Channels</getAllChannels>");
	getAllChannels.click(function () {
		triggerGetAllChannels();
	});
	$("#Linker").append(getAllChannels);
	const getComLinkedGroup1 = $("<getComLinkedGroup1>Get Components Linked with Group1</getComLinkedGroup1>");
	getComLinkedGroup1.click(function () {
		triggerGetComLinkedGroup1();
	});
	$("#Linker").append(getComLinkedGroup1);
	const getComLinkedCurWindow = $("<getComLinkedCurWindow>Get Components Linked with Current window</getComLinkedCurWindow>");
	getComLinkedCurWindow.click(function () {
		triggerGetComLinkedCurWindow();
	});
	$("#Linker").append(getComLinkedCurWindow);
	const getWinLinkedGroup1 = $("<getWinLinkedGroup1>Get Windows Linked with Group1</getWinLinkedGroup1>");
	getWinLinkedGroup1.click(function () {
		triggerGetWinLinkedGroup1();
	});
	$("#Linker").append(getWinLinkedGroup1);
	const getWinLinkedCurWindow = $("<getWinLinkedCurWindow>Get Windows Linked with Current window</getWinLinkedCurWindow>");
	getWinLinkedCurWindow.click(function () {
		triggerGetWinLinkedCurWindow();
	});
	$("#Linker").append(getWinLinkedCurWindow);
	const getState = $("<getState>Get State of Current window</getState>");
	getState.click(function () {
		triggerGetState();
	});
	$("#Linker").append(getState);
	const linkToGroup1 = $("<linkToGroup1>Link to Group1</linkToGroup1>");
	linkToGroup1.click(function () {
		triggerLinkToGroup1();
	});
	$("#Linker").append(linkToGroup1);
	const unlinkToGroup1 = $("<unlinkToGroup1>Unlink to Group1</unlinkToGroup1>");
	unlinkToGroup1.click(function () {
		triggerUnlinkToGroup1();
	});
	$("#Linker").append(unlinkToGroup1);
	const startOnStateChange = $("<startOnStateChange>Start on state change</startOnStateChange>");
	startOnStateChange.click(function () {
		triggerStartOnStateChange();
	});
	$("#Linker").append(startOnStateChange);
	const openLinkerWindow = $("<openLinkerWindow>Open Linker Window</openLinkerWindow>");
	openLinkerWindow.click(function () {
		triggerOpenLinkerWindow();
	});
	$("#Linker").append(openLinkerWindow);
	const linkerPub = $("<linkerPub>Linker Publish</linkerPub>");
	linkerPub.click(function () {
		triggerLinkerPub();
	});
	$("#Linker").append(linkerPub);

	/* Logger Client buttons */
	const debug = $("<debug>Debug</debug>");
	debug.click(function () {
		triggerDebug();
	});
	$("#Logger").append(debug);
	const error = $("<error>Error</error>");
	error.click(function () {
		triggerError();
	});
	$("#Logger").append(error);
	const info = $("<info>Info</info>");
	info.click(function () {
		triggerInfo();
	});
	$("#Logger").append(info);
	const log = $("<log>Log</log>");
	log.click(function () {
		triggerLog();
	});
	$("#Logger").append(log);
	const verbose = $("<verbose>Verbose</verbose>");
	verbose.click(function () {
		triggerVerbose();
	});
	$("#Logger").append(verbose);
	const warn = $("<warn>Warn</warn>");
	warn.click(function () {
		triggerWarn();
	});
	$("#Logger").append(warn);

	/* Router client buttons */
	const addPubSubResponder = $("<addPubSubResponder>Add Pub Sub Responder</addPubSubResponder>");
	addPubSubResponder.click(function () {
		triggerAddPubSubResponder();
	});
	$("#Router").append(addPubSubResponder);
	const removePubSubResponder = $("<removePubSubResponder>Remove Pub Sub Responder</removePubSubResponder>");
	removePubSubResponder.click(function () {
		triggerRemovePubSubResponder();
	});
	$("#Router").append(removePubSubResponder);
	const publish = $("<publish>Publish</publish>");
	publish.click(function () {
		triggerPublish();
	});
	$("#Router").append(publish);
	const query = $("<query>Query</query>");
	query.click(function () {
		triggerQuery();
	});
	$("#Router").append(query);
	const transmit = $("<transmit>Transmit</transmit>");
	transmit.click(function () {
		triggerTransmit();
	});
	$("#Router").append(transmit);
	const disconnectAll = $("<disconnectAll>Disconnect all</disconnectAll>");
	disconnectAll.click(function () {
		triggerDisconnectAll();
	});
	$("#Router").append(disconnectAll);

	/* Workspace client buttons */
	const autoArrange = $("<autoArrange>Auto Arrange</autoArrange>");
	autoArrange.click(function () {
		triggerAutoArrange();
	});
	$("#Workspace").append(autoArrange);
	const bringWinsToFront = $("<bringWinsToFront>Bring Windows To Front</bringWinsToFront>");
	bringWinsToFront.click(function () {
		triggerBringWinsToFront();
	});
	$("#Workspace").append(bringWinsToFront);
	const createWorkspace = $("<createWorkspace>Create Workspace</createWorkspace>");
	createWorkspace.click(function () {
		triggerCreateWorkspace();
	});
	$("#Workspace").append(createWorkspace);
	const exportWorkspace = $("<exportWorkspace>Export Workspace</exportWorkspace>");
	exportWorkspace.click(function () {
		triggerExportWorkspace();
	});
	$("#Workspace").append(exportWorkspace);
	const getActiveWorkspace = $("<getActiveWorkspace>Get Active Workspace</getActiveWorkspace>");
	getActiveWorkspace.click(function () {
		triggerGetActiveWorkspace();
	});
	$("#Workspace").append(getActiveWorkspace);
	const getWorkspaces = $("<getWorkspaces>Get Workspaces</getWorkspaces>");
	getWorkspaces.click(function () {
		triggerGetWorkspaces();
	});
	$("#Workspace").append(getWorkspaces);
	const importWorkspace = $("<importWorkspace>Import Workspace</importWorkspace>");
	importWorkspace.click(function () {
		triggerImportWorkspace();
	});
	$("#Workspace").append(importWorkspace);
	const minimizeAll = $("<minimizeAll>Minimize All</minimizeAll>");
	minimizeAll.click(function () {
		triggerMinimizeAll();
	});
	$("#Workspace").append(minimizeAll);
	const removeWorkspace = $("<removeWorkspace>Remove Workspace</removeWorkspace>");
	removeWorkspace.click(function () {
		triggerRemoveWorkspace();
	});
	$("#Workspace").append(removeWorkspace);
	const renameWorkspace = $("<renameWorkspace>Rename Workspace</renameWorkspace>");
	renameWorkspace.click(function () {
		triggerRenameWorkspace();
	});
	$("#Workspace").append(renameWorkspace);
	const saveWorkspace = $("<saveWorkspace>Save Workspace</saveWorkspace>");
	saveWorkspace.click(function () {
		triggerSaveWorkspace();
	});
	$("#Workspace").append(saveWorkspace);
	const saveAsWorkspace = $("<saveAsWorkspace>Save As Workspace</saveAsWorkspace>");
	saveAsWorkspace.click(function () {
		triggerSaveAsWorkspace();
	});
	$("#Workspace").append(saveAsWorkspace);
	const switchToWorkspace = $("<switchToWorkspace>Switch To Workspace</switchToWorkspace>");
	switchToWorkspace.click(function () {
		triggerSwitchToWorkspace();
	});
	$("#Workspace").append(switchToWorkspace);

	/* Distributed Store Client buttons*/
	const createStore = $("<createStore>Create Store</createStore>");
	createStore.click(function () {
		triggerCreateStore();
	});
	$("#DistributedStore").append(createStore);
	const getStore = $("<getStore>Get Store</getStore>");
	getStore.click(function () {
		triggerGetStore();
	});
	$("#DistributedStore").append(getStore);


	const getStoreValue = $("<getStoreValue>Get Store Value</getStoreValue>");
	getStoreValue.click(function () {
		triggerGetStoreValue();
	});
	$("#DistributedStore").append(getStoreValue);
	const setStoreValue1 = $("<setStoreValue1>Set Store Value field1</setStoreValue1>");
	setStoreValue1.click(function () {
		triggerSetStoreValue('field1');
	});
	$("#DistributedStore").append(setStoreValue1);
	const setStoreValue2 = $("<setStoreValue2>Set Store Value field2</setStoreValue2>");
	setStoreValue2.click(function () {
		triggerSetStoreValue('field2');
	});
	$("#DistributedStore").append(setStoreValue2);
	const removeStore = $("<removeStore>Remove Store</removeStore>");
	removeStore.click(function () {
		triggerRemoveStore();
	});
	$("#DistributedStore").append(removeStore);

	/* Storage client buttons */
	const setStorageUser = $("<setStorageUser>Set User</setStorageUser>");
	setStorageUser.click(function () {
		triggerSetStorageUser();
	});
	$("#Storage").append(setStorageUser);
	const setStorageStore = $("<setStorageStore>Set Store</setStorageStore>");
	setStorageStore.click(function () {
		triggerSetStorageStore();
	});
	$("#Storage").append(setStorageStore);
	const saveStorageValue = $("<saveStorageValue>Save Value</saveStorageValue>");
	saveStorageValue.click(function () {
		triggerSaveStorageValue();
	});
	$("#Storage").append(saveStorageValue);
	const getStorageValue = $("<getStorageValue>Get Storage Value</getStorageValue>");
	getStorageValue.click(function () {
		triggerGetStorageValue();
	});
	$("#Storage").append(getStorageValue);
	const removeStorageValue = $("<removeStorageValue>Remove Value</removeStorageValue>");
	removeStorageValue.click(function () {
		triggerRemoveStorageValue();
	});
	$("#Storage").append(removeStorageValue);
	const getStorageKeys = $("<getStorageKeys>Get Storage Keys</getStorageKeys>");
	getStorageKeys.click(function () {
		triggerGetStorageKeys();
	});
	$("#Storage").append(getStorageKeys);

	/* WindowClient buttons */
	const bringWindowToFront = $("<bringWindowToFront>Bring Windows To Front</bringWindowToFront>");
	bringWindowToFront.click(function () {
		triggerBringWindowToFront();
	});
	$("#Windows").append(bringWindowToFront);
	const cancelTilingOrTabbing = $("<cancelTilingOrTabbing>Cancel Tiling or Tabbing</cancelTilingOrTabbing>");
	cancelTilingOrTabbing.click(function () {
		triggerCancelTilingOrTabbing();
	});
	$("#Windows").append(cancelTilingOrTabbing);
	const closeWindow = $("<closeWindow>Close Window</closeWindow>");
	closeWindow.click(function () {
		triggerCloseWindow();
	});
	$("#Windows").append(closeWindow);
	const fitToDom = $("<fitToDom>Fit to Dom</fitToDom>");
	fitToDom.click(function () {
		triggerFitToDom();
	});
	$("#Windows").append(fitToDom);
	const getBounds = $("<getBounds>Get Bounds</getBounds>");
	getBounds.click(function () {
		triggerGetBounds();
	});
	$("#Windows").append(getBounds);

	const setComponentState = $("<setComponentState>Set Component State</setComponentState>");
	setComponentState.click(function () {
		triggerSetComponentState();
	});
	$("#Windows").append(setComponentState);
	const removeComponentState = $("<removeComponentState>Remove Component State</removeComponentState>");
	removeComponentState.click(function () {
		triggerRemoveComponentState();
	});
	$("#Windows").append(removeComponentState);
	const getComponentState = $("<getComponentState>Get Component State</getComponentState>");
	getComponentState.click(function () {
		triggerGetComponentState();
	});
	$("#Windows").append(getComponentState);
	const getCurWin = $("<getCurWin>Get Current Window</getCurWin>");
	getCurWin.click(function () {
		triggerGetCurWin();
	});
	$("#Windows").append(getCurWin);
	const getSpawnData = $("<getSpawnData>Get Spawn Data</getSpawnData>");
	getSpawnData.click(function () {
		triggerGetSpawnData();
	});
	$("#Windows").append(getSpawnData);
	const getStackedWindow = $("<getStackedWindow>Get Stacked Window</getStackedWindow>");
	getStackedWindow.click(function () {
		triggerGetStackedWindow();
	});
	$("#Windows").append(getStackedWindow);
	const getWindowsGroup = $("<getWindowsGroup>Get Window Groups</getWindowsGroup>");
	getWindowsGroup.click(function () {
		triggerGetWindowsGroup();
	});
	$("#Windows").append(getWindowsGroup);
	const getWindowIdentifier = $("<getWindowIdentifier>Get Window Identifier</getWindowIdentifier>");
	getWindowIdentifier.click(function () {
		triggerGetWindowIdentifier();
	});
	$("#Windows").append(getWindowIdentifier);
	const getWindowNameForDocking = $("<getWindowNameForDocking>Get Window Name For Docking</getWindowNameForDocking>");
	getWindowNameForDocking.click(function () {
		triggerGetWindowNameForDocking();
	});
	$("#Windows").append(getWindowNameForDocking);
	const getWindowTitle = $("<getWindowTitle>Get Window Title</getWindowTitle>");
	getWindowTitle.click(function () {
		triggerGetWindowTitle();
	});
	$("#Windows").append(getWindowTitle);
	const estHeaderCommandChannel = $("<estHeaderCommandChannel>Establish Header Command Channel</estHeaderCommandChannel>");
	estHeaderCommandChannel.click(function () {
		triggerEstHeaderCommandChannel();
	});
	$("#Windows").append(estHeaderCommandChannel);
	const injectHeader = $("<injectHeader>Inject Header</injectHeader>");
	injectHeader.click(function () {
		triggerInjectHeader();
	});
	$("#Windows").append(injectHeader);
	const maximize = $("<maximize>Maximize</maximize>");
	maximize.click(function () {
		triggerMaximize();
	});
	$("#Windows").append(maximize);
	const minimize = $("<minimize>Minimize</minimize>");
	minimize.click(function () {
		triggerMinimize();
	});
	$("#Windows").append(minimize);
	const restore = $("<restore>Restore</restore>");
	restore.click(function () {
		triggerRestore();
	});
	$("#Windows").append(restore);
	const sendWinIdentifierForTilingOrTabbing = $("<sendWinIdentifierForTilingOrTabbing>Send Window Identifier For Tiling or Tabbing</sendWinIdentifierForTilingOrTabbing>");
	sendWinIdentifierForTilingOrTabbing.click(function () {
		triggerSendWinIdentifierForTilingOrTabbing();
	});
	$("#Windows").append(sendWinIdentifierForTilingOrTabbing);
	const setAlwaysOnTop = $("<setAlwaysOnTop>Set Always On Top</setAlwaysOnTop>");
	setAlwaysOnTop.click(function () {
		triggerSetAlwaysOnTop();
	});
	$("#Windows").append(setAlwaysOnTop);
	const setWindowTitle = $("<setWindowTitle>Set Window Title</setWindowTitle>");
	setWindowTitle.click(function () {
		triggerSetWindowTitle();
	});
	$("#Windows").append(setWindowTitle);
	const showAtMousePos = $("<showAtMousePos>Show At Mouse Position</setWindowTshowAtMousePositle>");
	showAtMousePos.click(function () {
		triggerShowAtMousePos();
	});
	$("#Windows").append(showAtMousePos);
	const startTilingOrTabbing = $("<startTilingOrTabbing>Start Tiling Or Tabbing</startTilingOrTabbing>");
	startTilingOrTabbing.click(function () {
		triggerStartTilingOrTabbing();
	});
	$("#Windows").append(startTilingOrTabbing);
	const stopTilingOrTabbing = $("<stopTilingOrTabbing>Stop Tiling Or Tabbing</stopTilingOrTabbing>");
	stopTilingOrTabbing.click(function () {
		triggerStopTilingOrTabbing();
	});
	$("#Windows").append(stopTilingOrTabbing);

	/* Dialog Buttons */
	const openDialog = $("<openDialog>Open Dialog</openDialog>");
	openDialog.click(function () {
		triggerOpenDialog();
	});
	$("#Dialog").append(openDialog);

	/* Search Client Buttons */
	const search = $("<search>search</search>");
	search.click(function () {
		triggerSearch();
	});
	$("#Search").append(search);
}
/* SeachClient Functions*/
function triggerSearch() {
	if (document.getElementById('symbolInput').value != '')
		FSBL.Clients.SearchClient.search({
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
	FSBL.Clients.DialogManager.open('yesNo', dialogParams, function (err, response) {
		//choice can be `'affirmative'`, `'negative'`, or `'cancel'`.
		console.log("Response Received: " + response.choice)
		if (err || response.choice === 'affirmative') {
			//alert("Response Received: "+response.choice)
		}
	});
}

/* WindowClient functions */
function triggerStopTilingOrTabbing() {
	var windowIdentifier = FSBL.Clients.WindowClient.getWindowIdentifier()
	FSBL.Clients.WindowClient.startTilingOrTabbing({
		windowIdentifier: windowIdentifier
	}, function (err) {
		if (!err) {
			alert('Stopped')
		}
	})
}

function triggerStartTilingOrTabbing() {
	var windowIdentifier = FSBL.Clients.WindowClient.getWindowIdentifier()
	FSBL.Clients.WindowClient.startTilingOrTabbing({
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
	FSBL.Clients.WindowClient.showAtMousePosition()
}

function triggerSetWindowTitle() {
	if (document.getElementById('symbolInput').value != '')
		FSBL.Clients.WindowClient.setWindowTitle(document.getElementById('symbolInput').value)
	else
		alert('Input a value.')
}

function triggerSetAlwaysOnTop() {
	FSBL.Clients.WindowClient.setAlwaysOnTop(true, function (err) {
		if (!err) {
			alert('Sussceed.')
		}
	})
}

function triggerSendWinIdentifierForTilingOrTabbing() {
	var windowIdentifier = FSBL.Clients.WindowClient.getWindowIdentifier()
	FSBL.Clients.WindowClient.sendIdentifierForTilingOrTabbing({
		windowIdentifier: windowIdentifier
	}, function (err) {
		if (!err) {
			alert('Sussceed.')
		}
	})
}

function triggerRestore() {
	FSBL.Clients.WindowClient.restore(function (err) {
		if (!err) {}
	})
}

function triggerRemoveComponentState() {
	FSBL.Clients.WindowClient.removeComponentState({
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
	FSBL.Clients.WindowClient.minimize(function (err) {
		if (!err) {}

	})
}

function triggerMaximize() {
	FSBL.Clients.WindowClient.maximize(function (err) {
		if (!err) {}

	})
}

function triggerInjectHeader() {
	FSBL.Clients.WindowClient.injectHeader({}, function (err) {

	})
}

function triggerEstHeaderCommandChannel() {
	FSBL.Clients.WindowClient.headerCommandChannel(function (err, header) {
		console.log(header)
	})
}

function triggerGetWindowTitle() {
	var windowTitle = FSBL.Clients.WindowClient.getWindowTitle()
	if (windowTitle)
		alert('Sussceed. Window Title: ' + windowTitle)
}

function triggerGetWindowNameForDocking() {
	var windowName = FSBL.Clients.WindowClient.getWindowNameForDocking()
	if (windowName) {
		alert('Sussceed. Window Name: ' + windowName)
	}
}

function triggerGetWindowIdentifier() {
	var windowIdentifier = FSBL.Clients.WindowClient.getWindowIdentifier()
	if (windowIdentifier) {
		alert('Sussceed. See console for detail.')
		console.log(windowIdentifier)
	}
}

function triggerGetWindowsGroup() {
	var windowGroups = FSBL.Clients.WindowClient.getWindowGroups()
	if (windowGroups) {
		alert('Sussceed. See console for detail.')
		console.log(windowGroups)
	}
}

function triggerGetStackedWindow() {
	FSBL.Clients.WindowClient.getStackedWindow({}, function (err, stackedWindow) {
		if (!err) {
			console.log(stackedWindow)
		}
	})
}

function triggerGetSpawnData() {
	var spawnData = FSBL.Clients.WindowClient.getSpawnData()
	if (spawnData) {
		alert('Sussceed. See console for detail.')
		console.log(spawnData)
	}
}

function triggerGetCurWin() {
	var currentWindow = FSBL.Clients.WindowClient.getCurrentWindow()
	if (currentWindow) {
		alert('Sussceed. See console for detail.')
		console.log(currentWindow)
	}
}

function triggerSetComponentState() {
	if (document.getElementById('symbolInput').value != '')
		FSBL.Clients.WindowClient.setComponentState({
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
	FSBL.Clients.WindowClient.getComponentState({}, function (err, state) {
		if (!err) {
			alert('Sussceed. See console for detail.')
			console.log(state)
		}
	})
}

function triggerGetBounds() {
	FSBL.Clients.WindowClient.getBounds(function (err, bounds) {
		if (!err) {
			alert('Sussceed. See console for detail.')
			console.log(bounds)
		}
	})
}

function triggerFitToDom() {
	FSBL.Clients.WindowClient.fitToDOM({
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
	FSBL.Clients.WindowClient.close(false);
}

function triggerCancelTilingOrTabbing() {
	FSBL.Clients.WindowClient.cancelTilingOrTabbing({
		windowIdentifier: FSBL.Clients.WindowClient.getWindowIdentifier()
	}, function (err) {
		if (!err) {
			alert('Sussceed.')
		}
	})
}

function triggerBringWindowToFront() {
	FSBL.Clients.WindowClient.bringWindowToFront()
}

/* Storage client functions */
function triggerGetStorageValue() {
	FSBL.Clients.StorageClient.get({
		topic: "finsemble",
		key: "testKey"
	}, function (err, val) {
		if (!err) {
			alert('Topic: finsemble, Key: testKey, value: ' + val)
		}
	})
}

function triggerGetStorageKeys() {
	FSBL.Clients.StorageClient.keys({
		topic: "finsemble"
	}, function (err, keys) {
		if (!err) {
			alert('Successed. Check console for detail.')
			console.log(keys)
		}
	})
}

function triggerRemoveStorageValue() {
	FSBL.Clients.StorageClient.remove({
		topic: "finsemble",
		key: "testKey"
	}, function (err) {
		if (!err)
			alert('Sussceed. Check console for detail.')
	})
}

function triggerSaveStorageValue() {
	if (document.getElementById('symbolInput').value != '')
		FSBL.Clients.StorageClient.save({
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
	FSBL.Clients.StorageClient.setStore({
		topic: "local",
		dataStore: "LocalStorageAdapter"
	}, function (err) {
		if (!err)
			alert('Sussceed. Check console for detail.')
	})
}

function triggerSetStorageUser() {
	FSBL.Clients.StorageClient.setUser({
		user: 'testUser'
	}, function (err) {
		if (!err)
			alert('Sussceed. Check console for detail.')
	})
}

/* Distributed store client functions */
function triggerSetStoreValue(field) {
	dsStore.setValue({
		field: field,
		value: document.getElementById('symbolInput').value
	}, function (err) {
		alert('Value set for '+field)
	})
}

function triggerGetStoreValue() {
	dsStore.getValue({
		field: 'field1'
	}, function (err, value) {
		alert('Field1: ' + value)
	})

}

function triggerRemoveStore() {
	FSBL.Clients.DistributedStoreClient.removeStore({
		store: 'testDs1',
	}, function (err) {
		if (!err) {
			alert('testDs1 removed.')
		} else
			alert('No such store.')
	})
}

function triggerGetStore() {
	FSBL.Clients.DistributedStoreClient.getStore({
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
	FSBL.Clients.DistributedStoreClient.createStore({
		store: 'testDs1',
		global: true,
		values: {
			field1: 'testdata1',
			field2: 'testdata2'
		}
	}, function (err, store) {
		if (!err) {
			dsStore = store
			alert('testDs1 created. See console for store detail')
			console.log(store)
		}
	})
}

/* Workspace client functions */
function triggerSwitchToWorkspace() {
	if (document.getElementById('symbolInput').value != '')
		FSBL.Clients.WorkspaceClient.switchTo({
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
		FSBL.Clients.WorkspaceClient.saveAs({
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
	FSBL.Clients.WorkspaceClient.save(function (err, response) {
		if (!err) {
			alert('Saved.')
		}
	})
}

function triggerRenameWorkspace() {
	if (document.getElementById('symbolInput').value != '')
		FSBL.Clients.WorkspaceClient.getActiveWorkspace(function (err, response) {
			if (!err) {
				FSBL.Clients.WorkspaceClient.rename({
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
		FSBL.Clients.WorkspaceClient.remove({
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
	FSBL.Clients.WorkspaceClient.minimizeAll({}, function (err) {
		if (!err) {}
	})
}


function triggerImportWorkspace() {
	FSBL.Clients.WorkspaceClient.getActiveWorkspace(function (err, response) {
		if (!err) {
			FSBL.Clients.WorkspaceClient.export({
				workspaceName: response.data.name
			}, function (err, workspaceDefinition) {
				if (!err) {
					FSBL.Clients.WorkspaceClient.import({
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
	FSBL.Clients.WorkspaceClient.getWorkspaces(function (err, response) {
		if (!err) {
			console.log(response)
			alert('Sussceed. See console for detail')
		}
	})
}

function triggerGetActiveWorkspace() {
	FSBL.Clients.WorkspaceClient.getActiveWorkspace(function (err, response) {
		if (!err) {
			console.log(response)
			alert('Sussceed. See console for detail')
		}
	})
}

function triggerExportWorkspace() {
	if (document.getElementById('symbolInput').value != '')
		FSBL.Clients.WorkspaceClient.export({
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
		FSBL.Clients.WorkspaceClient.createWorkspace(document.getElementById('symbolInput').value, {}, function (err, response) {
			if (!err) {

			}
		})
	else
		alert('Input a name!')
}

function triggerBringWinsToFront() {
	FSBL.Clients.WorkspaceClient.bringWindowsToFront({}, function () {

	})
}

function triggerAutoArrange() {
	FSBL.Clients.WorkspaceClient.autoArrange({}, function () {

	})
}

/* Router client functions */
function triggerDisconnectAll() {
	FSBL.Clients.RouterClient.disconnectAll()
	alert('Disconnected all.')
}

function triggerTransmit() {
	FSBL.Clients.RouterClient.transmit('symbol', {
		'data': document.getElementById('symbolInput').value
	})
}

function triggerQuery() {
	FSBL.Clients.RouterClient.query("symbol", {
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
	FSBL.Clients.RouterClient.publish('symbol', {
		'symbol': document.getElementById('symbolInput').value
	})
}

function triggerRemovePubSubResponder() {
	FSBL.Clients.RouterClient.removePubSubResponder('symbol')
}

function triggerAddPubSubResponder() {
	FSBL.Clients.RouterClient.addPubSubResponder("symbol", {
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
	FSBL.Clients.Logger.warn('This is a warn message')
}

function triggerVerbose() {
	FSBL.Clients.Logger.verbose('This is a verbose message')
}

function triggerLog() {
	FSBL.Clients.Logger.log('This is a log message')
}

function triggerInfo() {
	FSBL.Clients.Logger.info('This an info message')
}

function triggerError() {
	FSBL.Clients.Logger.error('This is an error message')
}

function triggerDebug() {
	FSBL.Clients.Logger.debug('This is a debug message')
}

/* Linker client functions */
function triggerLinkerPub() {
	FSBL.Clients.LinkerClient.publish({
		dataType: "symbol",
		data: document.getElementById('symbolInput').value
	}, function (err) {
		if (!err) {
			//alert('Publish sussceed.')
		}
	})
}

function triggerOpenLinkerWindow() {
	FSBL.Clients.LinkerClient.openLinkerWindow(function (err, response) {
		if (!err) {
			console.log(response)
		}
	})
}

function triggerStartOnStateChange() {
	FSBL.Clients.LinkerClient.onStateChange(function (err, response) {
		if (!err) {
			alert("Linker state changed. See console for detail.")
			console.log(response)
		}
	})
}

function triggerLinkToGroup1() {
	FSBL.Clients.LinkerClient.linkToChannel("group1", null, function (err, channel) {
		if (!err) {
			alert('Link to group1 succeed. See console for detail')
			console.log(channel)
		}
	})
}

function triggerUnlinkToGroup1() {
	FSBL.Clients.LinkerClient.unlinkFromChannel("group1", null, function (err, channel) {
		if (!err) {
			alert('Unlink to group1 succeed. See console for detail')
			console.log(channel)
		}
	})
}

function triggerGetState() {
	FSBL.Clients.LinkerClient.getState(FSBL.Clients.WindowClient.getWindowIdentifier, function (err, state) {
		if (!err) {
			alert('Get state succeed. See console for detail')
			console.log(state)
		}
	})
}

function triggerGetWinLinkedCurWindow() {
	FSBL.Clients.LinkerClient.getLinkedWindows(FSBL.Clients.WindowClient.getWindowIdentifier, function (err, windows) {
		if (!err) {
			alert(windows.length + ' windows linked with current component. See console for detail.')
			console.log(windows)
		}
	})
}

function triggerGetWinLinkedGroup1() {
	FSBL.Clients.LinkerClient.getLinkedWindows({
		channels: ['group1']
	}, function (err, windows) {
		if (!err) {
			alert(windows.length + ' windows linked with Group1. See console for detail.')
			console.log(windows)
		}
	})
}

function triggerGetComLinkedCurWindow() {
	FSBL.Clients.LinkerClient.getLinkedComponents(FSBL.Clients.WindowClient.getWindowIdentifier, function (err, components) {
		if (!err) {
			alert(components.length + ' components linked with current component. See console for detail.')
			console.log(components)
		}
	})
}

function triggerGetComLinkedGroup1() {
	FSBL.Clients.LinkerClient.getLinkedComponents({
		channels: ['group1']
	}, function (err, components) {
		if (!err) {
			alert(components.length + ' components linked with Group1. See console for detail.')
			console.log(components)
		}
	})
}

function triggerGetAllChannels() {
	FSBL.Clients.LinkerClient.getAllChannels(function (err, channels) {
		if (!err) {
			alert(channels.length + ' Linker channels found. See console for detail.')
			console.log(channels)
		}
	})
}


/* Launcher client functions */
function triggerGetActiveDescriptors() {
	FSBL.Clients.LauncherClient.getActiveDescriptors(function (err, desc) {
		if (!err) {
			console.log(desc)
			alert('There are ' + Object.keys(desc).length + ' window descriptors. See console for detail.')
		}
	})
}

function triggerGetComponentDefaultConfig() {
	FSBL.Clients.LauncherClient.getComponentDefaultConfig('test1', function (err, config) {
		if (!err) {
			console.log(config)
			alert('Test1 component found. See console for detail.')
		}
	})
}

function triggerGetComponentList() {
	FSBL.Clients.LauncherClient.getComponentList(function (err, componentList) {
		if (!err) {
			console.log(componentList)
			alert('Component list found. See console for detail.')
		}
	})
}

function triggerGetComponentsThatCanReceiveDataTypes() {
	//This function cooperate with field "advertiseReceivers" in component.json which should be deprecated
	FSBL.Clients.LauncherClient.getComponentsThatCanReceiveDataTypes({
		dataTypes: ['symbol']
	}, function (err, componentList) {
		if (!err) {
			console.log(componentList)
			alert('Component list found. See console for detail.')
		}
	})
}

function triggerGetMonitorInfo() {
	FSBL.Clients.LauncherClient.getMonitorInfo({}, function (err, monitorList) {
		if (!err) {
			console.log(monitorList)
			alert('Monitor list found. See console for detail.')
		}
	})
}

function triggerGetMonitorInfoAll() {
	FSBL.Clients.LauncherClient.getMonitorInfoAll(function (err, monitorList) {
		if (!err) {
			console.log(monitorList)
			alert('Monitor list found. See console for detail.')
		}
	})
}

function triggerGetMyWindowIdentifier() {
	//Should the cb able to return 'err'?
	FSBL.Clients.LauncherClient.getMyWindowIdentifier(function (windowIdentifer) {
		if (windowIdentifer) {
			console.log(windowIdentifer)
			alert('Window Identifer found. See console for detail.')
		}
	})
}

function triggerRegisterComponent() {
	FSBL.Clients.LauncherClient.registerComponent({
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
	FSBL.Clients.LauncherClient.unRegisterComponent({
		componentType: 'testRegisterComponent'
	}, function (err) {
		if (!err) {
			alert("Unregister Component Succeed.")
		}
	})
}

function triggerSpawnComponent() {
	FSBL.Clients.LauncherClient.spawn('API Test 2', {
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
		componentType: "API Test 2",
		windowName: FSBL.Clients.WindowClient.options.name + ".apitest2"
	};

	FSBL.Clients.LauncherClient.showWindow(
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
	FSBL.Clients.HotkeyClient.addGlobalHotkey(keys, onGlobalHotkeyTriggered, onGlobalHotkeyRegistered);
}

function unregisterGlobalHotkey() {
	const keys = [keyMap.ctrl, keyMap.q];
	FSBL.Clients.HotkeyClient.removeGlobalHotkey(keys, onGlobalHotkeyTriggered, onGlobalHotkeyUnregistered);
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
	FSBL.Clients.HotkeyClient.addLocalHotkey(keys, onLocalHotkeyTriggered, onLocalHotkeyRegistered);
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
	FSBL.Clients.HotkeyClient.removeLocalHotkey(keys, onLocalHotkeyTriggered, onLocalHotkeyUnregistered);
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
	FSBL.Clients.DragAndDropClient.setEmitters({
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