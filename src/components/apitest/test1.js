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
		document.getElementById('displayMsg').value = 'RouterClient is ready'
	})

	document.getElementById('dsBtn').click()

	/* Global hotkey button */
	const registerGlobalHotKey = $("<registerGlobalHotKey>Register Global Ctrl+Q</registerGlobalHotKey><br/>");
	registerGlobalHotKey.click(function () {
		registerGlobalHotkey();
	});
	$("#Hotkeys").append(registerGlobalHotKey);

	const unregisterGlobalHotKey = $("<unregisterGlobalHotKey>Unregister Global Ctrl+Q</unregisterGlobalHotKey><br/>");
	unregisterGlobalHotKey.click(function () {
		unregisterGlobalHotkey();
	});
	$("#Hotkeys").append(unregisterGlobalHotKey);

	/* Local hotkey button */
	const registerLocalHotKey = $("<registerLocalHotKey>Register Local Ctrl+Q</registerLocalHotKey><br/>");
	registerLocalHotKey.click(function () {
		registerLocalHotkey();
	});
	$("#Hotkeys").append(registerLocalHotKey);

	const unregisterLocalHotKey = $("<unregisterLocalHotKey>Unregister Local Ctrl+Q</unregisterLocalHotKey><br/>");
	unregisterLocalHotKey.click(function () {
		unregisterLocalHotkey();
	});
	$("#Hotkeys").append(unregisterLocalHotKey);

	/* Notification buttons */
	const notification = $("<notification>Trigger Notification</notification><br/>");
	notification.click(function () {
		triggerNotification();
	});
	$("#Notification").append(notification);

	/* LauncherClient buttons */
	const getActiveDescriptors = $("<getActiveDescriptors>Get Active Descriptor</getActiveDescriptors><br/>");
	getActiveDescriptors.click(function () {
		triggerGetActiveDescriptors();
	});
	$("#Launcher").append(getActiveDescriptors);
	const getComponentDefaultConfig = $("<getComponentDefaultConfig>Get Component Default Config</getComponentDefaultConfig><br/>");
	getComponentDefaultConfig.click(function () {
		triggerGetComponentDefaultConfig();
	});
	$("#Launcher").append(getComponentDefaultConfig);
	const getComponentList = $("<getComponentList>Get Component List</getComponentList><br/>");
	getComponentList.click(function () {
		triggerGetComponentList();
	});
	$("#Launcher").append(getComponentList);
	const getComponentsThatCanReceiveDataTypes = $("<getComponentsThatCanReceiveDataTypes>Get Components That Can Receive Data Types</getComponentsThatCanReceiveDataTypes><br/>");
	getComponentsThatCanReceiveDataTypes.click(function () {
		triggerGetComponentsThatCanReceiveDataTypes();
	});
	$("#Launcher").append(getComponentsThatCanReceiveDataTypes);
	const getMonitorInfo = $("<getMonitorInfo>Get Monitor Info</getMonitorInfo><br/>");
	getMonitorInfo.click(function () {
		triggerGetMonitorInfo();
	});
	$("#Launcher").append(getMonitorInfo);
	const getMonitorInfoAll = $("<getMonitorInfoAll>Get Monitor Info All</getMonitorInfoAll><br/>");
	getMonitorInfoAll.click(function () {
		triggerGetMonitorInfoAll();
	});
	$("#Launcher").append(getMonitorInfoAll);
	const getMyWindowIdentifier = $("<getMyWindowIdentifier>Get My Window Identifer</getMyWindowIdentifier><br/>");
	getMyWindowIdentifier.click(function () {
		triggerGetMyWindowIdentifier();
	});
	$("#Launcher").append(getMyWindowIdentifier);
	const registerComponent = $("<registerComponent>Register Component</registerComponent><br/>");
	registerComponent.click(function () {
		triggerRegisterComponent();
	});
	$("#Launcher").append(registerComponent);
	const unregisterComponent = $("<unregisterComponent>Unregister Component</unregisterComponent><br/>");
	unregisterComponent.click(function () {
		triggerUnregisterComponent();
	});
	$("#Launcher").append(unregisterComponent);
	const spawnComponent = $("<spawnComponent>Spawn Component</spawnComponent><br/>");
	spawnComponent.click(function () {
		triggerSpawnComponent();
	});
	$("#Launcher").append(spawnComponent);
	const showWindow = $("<showWindow>Show Window</showWindow><br/>");
	showWindow.click(function () {
		triggerShowWindow();
	});
	$("#Launcher").append(showWindow);

	/* Linker Client buttons */
	const getAllChannels = $("<getAllChannels>Get All Channels</getAllChannels><br/>");
	getAllChannels.click(function () {
		triggerGetAllChannels();
	});
	$("#Linker").append(getAllChannels);
	const getComLinkedGroup1 = $("<getComLinkedGroup1>Get Components Linked with Group1</getComLinkedGroup1><br/>");
	getComLinkedGroup1.click(function () {
		triggerGetComLinkedGroup1();
	});
	$("#Linker").append(getComLinkedGroup1);
	const getComLinkedCurWindow = $("<getComLinkedCurWindow>Get Components Linked with Current window</getComLinkedCurWindow><br/>");
	getComLinkedCurWindow.click(function () {
		triggerGetComLinkedCurWindow();
	});
	$("#Linker").append(getComLinkedCurWindow);
	const getWinLinkedGroup1 = $("<getWinLinkedGroup1>Get Windows Linked with Group1</getWinLinkedGroup1><br/>");
	getWinLinkedGroup1.click(function () {
		triggerGetWinLinkedGroup1();
	});
	$("#Linker").append(getWinLinkedGroup1);
	const getWinLinkedCurWindow = $("<getWinLinkedCurWindow>Get Windows Linked with Current window</getWinLinkedCurWindow><br/>");
	getWinLinkedCurWindow.click(function () {
		triggerGetWinLinkedCurWindow();
	});
	$("#Linker").append(getWinLinkedCurWindow);
	const getState = $("<getState>Get State of Current window</getState><br/>");
	getState.click(function () {
		triggerGetState();
	});
	$("#Linker").append(getState);
	const linkToGroup1 = $("<linkToGroup1>Link to Group1</linkToGroup1><br/>");
	linkToGroup1.click(function () {
		triggerLinkToGroup1();
	});
	$("#Linker").append(linkToGroup1);
	const linkerPub = $("<linkerPub>Linker Publish</linkerPub><br/>");
	linkerPub.click(function () {
		triggerLinkerPub();
	});
	$("#Linker").append(linkerPub);
	
	const startOnStateChange = $("<startOnStateChange>Start on state change</startOnStateChange><br/>");
	startOnStateChange.click(function () {
		triggerStartOnStateChange();
	});
	$("#Linker").append(startOnStateChange);
	const openLinkerWindow = $("<openLinkerWindow>Open Linker Window</openLinkerWindow><br/>");
	openLinkerWindow.click(function () {
		triggerOpenLinkerWindow();
	});
	$("#Linker").append(openLinkerWindow);
	const unlinkToGroup1 = $("<unlinkToGroup1>Unlink to Group1</unlinkToGroup1><br/>");
	unlinkToGroup1.click(function () {
		triggerUnlinkToGroup1();
	});
	$("#Linker").append(unlinkToGroup1);

	/* Logger Client buttons */
	const debug = $("<debug>Debug</debug><br/>");
	debug.click(function () {
		triggerDebug();
	});
	$("#Logger").append(debug);
	const error = $("<error>Error</error><br/>");
	error.click(function () {
		triggerError();
	});
	$("#Logger").append(error);
	const info = $("<info>Info</info><br/>");
	info.click(function () {
		triggerInfo();
	});
	$("#Logger").append(info);
	const log = $("<log>Log</log><br/>");
	log.click(function () {
		triggerLog();
	});
	$("#Logger").append(log);
	const verbose = $("<verbose>Verbose</verbose><br/>");
	verbose.click(function () {
		triggerVerbose();
	});
	$("#Logger").append(verbose);
	const warn = $("<warn>Warn</warn><br/>");
	warn.click(function () {
		triggerWarn();
	});
	$("#Logger").append(warn);

	/* Router client buttons */
	const addPubSubResponder = $("<addPubSubResponder>Add Pub Sub Responder</addPubSubResponder><br/>");
	addPubSubResponder.click(function () {
		triggerAddPubSubResponder();
	});
	$("#Router").append(addPubSubResponder);
	const removePubSubResponder = $("<removePubSubResponder>Remove Pub Sub Responder</removePubSubResponder><br/>");
	removePubSubResponder.click(function () {
		triggerRemovePubSubResponder();
	});
	$("#Router").append(removePubSubResponder);
	const publish = $("<publish>Publish</publish><p class='instruct'>Subscribe in 'API Testing 2' before publish</p><br/>");
	publish.click(function () {
		triggerPublish();
	});
	$("#Router").append(publish);
	const query = $("<query>Query</query><p class='instruct'>Add RESPONDER in 'API Testing 2' before query</p><br/>");
	query.click(function () {
		triggerQuery();
	});
	$("#Router").append(query);
	const transmit = $("<transmit>Transmit</transmit><p class='instruct'>Add LISTENER in 'API Testing 2' before publish</p><br/>");
	transmit.click(function () {
		triggerTransmit();
	});
	$("#Router").append(transmit);
	const disconnectAll = $("<disconnectAll>Disconnect all</disconnectAll><br/>");
	disconnectAll.click(function () {
		triggerDisconnectAll();
	});
	$("#Router").append(disconnectAll);

	/* Workspace client buttons */
	const autoArrange = $("<autoArrange>Auto Arrange</autoArrange><br/>");
	autoArrange.click(function () {
		triggerAutoArrange();
	});
	$("#Workspace").append(autoArrange);
	const bringWinsToFront = $("<bringWinsToFront>Bring Windows To Front</bringWinsToFront><br/>");
	bringWinsToFront.click(function () {
		triggerBringWinsToFront();
	});
	$("#Workspace").append(bringWinsToFront);
	const createWorkspace = $("<createWorkspace>Create Workspace</createWorkspace><br/>");
	createWorkspace.click(function () {
		triggerCreateWorkspace();
	});
	$("#Workspace").append(createWorkspace);
	const exportWorkspace = $("<exportWorkspace>Export Workspace</exportWorkspace><br/>");
	exportWorkspace.click(function () {
		triggerExportWorkspace();
	});
	$("#Workspace").append(exportWorkspace);
	const getActiveWorkspace = $("<getActiveWorkspace>Get Active Workspace</getActiveWorkspace><br/>");
	getActiveWorkspace.click(function () {
		triggerGetActiveWorkspace();
	});
	$("#Workspace").append(getActiveWorkspace);
	const getWorkspaces = $("<getWorkspaces>Get Workspaces</getWorkspaces><br/>");
	getWorkspaces.click(function () {
		triggerGetWorkspaces();
	});
	$("#Workspace").append(getWorkspaces);
	const importWorkspace = $("<importWorkspace>Import Workspace</importWorkspace><br/>");
	importWorkspace.click(function () {
		triggerImportWorkspace();
	});
	$("#Workspace").append(importWorkspace);
	const minimizeAll = $("<minimizeAll>Minimize All</minimizeAll><br/>");
	minimizeAll.click(function () {
		triggerMinimizeAll();
	});
	$("#Workspace").append(minimizeAll);
	const removeWorkspace = $("<removeWorkspace>Remove Workspace</removeWorkspace><br/>");
	removeWorkspace.click(function () {
		triggerRemoveWorkspace();
	});
	$("#Workspace").append(removeWorkspace);
	const renameWorkspace = $("<renameWorkspace>Rename Workspace</renameWorkspace><br/>");
	renameWorkspace.click(function () {
		triggerRenameWorkspace();
	});
	$("#Workspace").append(renameWorkspace);
	const saveWorkspace = $("<saveWorkspace>Save Workspace</saveWorkspace><br/>");
	saveWorkspace.click(function () {
		triggerSaveWorkspace();
	});
	$("#Workspace").append(saveWorkspace);
	const saveAsWorkspace = $("<saveAsWorkspace>Save As Workspace</saveAsWorkspace><br/>");
	saveAsWorkspace.click(function () {
		triggerSaveAsWorkspace();
	});
	$("#Workspace").append(saveAsWorkspace);
	const switchToWorkspace = $("<switchToWorkspace>Switch To Workspace</switchToWorkspace><br/>");
	switchToWorkspace.click(function () {
		triggerSwitchToWorkspace();
	});
	$("#Workspace").append(switchToWorkspace);

	/* Distributed Store Client buttons*/
	const createStore = $("<createStore>Create Store</createStore><br/>");
	createStore.click(function () {
		triggerCreateStore();
	});
	$("#DistributedStore").append(createStore);
	const getStore = $("<getStore>Get Store</getStore><br/>");
	getStore.click(function () {
		triggerGetStore();
	});
	$("#DistributedStore").append(getStore);


	const getStoreValue = $("<getStoreValue>Get Store Value</getStoreValue><br/>");
	getStoreValue.click(function () {
		triggerGetStoreValue();
	});
	$("#DistributedStore").append(getStoreValue);
	const setStoreValue1 = $("<setStoreValue1>Set Store Value field1</setStoreValue1><br/>");
	setStoreValue1.click(function () {
		triggerSetStoreValue('field1');
	});
	$("#DistributedStore").append(setStoreValue1);
	const setStoreValue2 = $("<setStoreValue2>Set Store Value field2</setStoreValue2><br/>");
	setStoreValue2.click(function () {
		triggerSetStoreValue('field2');
	});
	$("#DistributedStore").append(setStoreValue2);
	const removeStore = $("<removeStore>Remove Store</removeStore><br/>");
	removeStore.click(function () {
		triggerRemoveStore();
	});
	$("#DistributedStore").append(removeStore);

	/* Storage client buttons */
	const setStorageUser = $("<setStorageUser>Set User</setStorageUser><p class='instruct'>please reset in the function menu after validation.</p><br/>");
	setStorageUser.click(function () {
		triggerSetStorageUser();
	});
	$("#Storage").append(setStorageUser);
	const setStorageStore = $("<setStorageStore>Set Store</setStorageStore><br/>");
	setStorageStore.click(function () {
		triggerSetStorageStore();
	});
	$("#Storage").append(setStorageStore);
	const saveStorageValue = $("<saveStorageValue>Save Value</saveStorageValue><br/>");
	saveStorageValue.click(function () {
		triggerSaveStorageValue();
	});
	$("#Storage").append(saveStorageValue);
	const getStorageValue = $("<getStorageValue>Get Storage Value</getStorageValue><br/>");
	getStorageValue.click(function () {
		triggerGetStorageValue();
	});
	$("#Storage").append(getStorageValue);
	const getStorageKeys = $("<getStorageKeys>Get Storage Keys</getStorageKeys><br/>");
	getStorageKeys.click(function () {
		triggerGetStorageKeys();
	});
	$("#Storage").append(getStorageKeys);
	const removeStorageValue = $("<removeStorageValue>Remove Value</removeStorageValue><br/>");
	removeStorageValue.click(function () {
		triggerRemoveStorageValue();
	});
	$("#Storage").append(removeStorageValue);
	
	/* WindowClient buttons */
	const bringWindowToFront = $("<bringWindowToFront>Bring Windows To Front</bringWindowToFront><br/>");
	bringWindowToFront.click(function () {
		triggerBringWindowToFront();
	});
	$("#Windows").append(bringWindowToFront);
	const cancelTilingOrTabbing = $("<cancelTilingOrTabbing>Cancel Tiling or Tabbing</cancelTilingOrTabbing><br/>");
	cancelTilingOrTabbing.click(function () {
		triggerCancelTilingOrTabbing();
	});
	$("#Windows").append(cancelTilingOrTabbing);
	const closeWindow = $("<closeWindow>Close Window</closeWindow><br/>");
	closeWindow.click(function () {
		triggerCloseWindow();
	});
	$("#Windows").append(closeWindow);
	const fitToDom = $("<fitToDom>Fit to Dom</fitToDom><br/>");
	fitToDom.click(function () {
		triggerFitToDom();
	});
	$("#Windows").append(fitToDom);
	const getBounds = $("<getBounds>Get Bounds</getBounds><br/>");
	getBounds.click(function () {
		triggerGetBounds();
	});
	$("#Windows").append(getBounds);

	const setComponentState = $("<setComponentState>Set Component State</setComponentState><br/>");
	setComponentState.click(function () {
		triggerSetComponentState();
	});
	$("#Windows").append(setComponentState);
	const getComponentState = $("<getComponentState>Get Component State</getComponentState><br/>");
	getComponentState.click(function () {
		triggerGetComponentState();
	});
	$("#Windows").append(getComponentState);
	const removeComponentState = $("<removeComponentState>Remove Component State</removeComponentState><br/>");
	removeComponentState.click(function () {
		triggerRemoveComponentState();
	});
	$("#Windows").append(removeComponentState);
	const getCurWin = $("<getCurWin>Get Current Window</getCurWin><br/>");
	getCurWin.click(function () {
		triggerGetCurWin();
	});
	$("#Windows").append(getCurWin);
	const getSpawnData = $("<getSpawnData>Get Spawn Data</getSpawnData><br/>");
	getSpawnData.click(function () {
		triggerGetSpawnData();
	});
	$("#Windows").append(getSpawnData);
	const getStackedWindow = $("<getStackedWindow>Get Stacked Window</getStackedWindow><br/>");
	getStackedWindow.click(function () {
		triggerGetStackedWindow();
	});
	$("#Windows").append(getStackedWindow);
	const getWindowsGroup = $("<getWindowsGroup>Get Window Groups</getWindowsGroup><p class='instruct'>Group with 'API Testing 2' first</p><br/>");
	getWindowsGroup.click(function () {
		triggerGetWindowsGroup();
	});
	$("#Windows").append(getWindowsGroup);
	const getWindowIdentifier = $("<getWindowIdentifier>Get Window Identifier</getWindowIdentifier><br/>");
	getWindowIdentifier.click(function () {
		triggerGetWindowIdentifier();
	});
	$("#Windows").append(getWindowIdentifier);
	const getWindowNameForDocking = $("<getWindowNameForDocking>Get Window Name For Docking</getWindowNameForDocking><br/>");
	getWindowNameForDocking.click(function () {
		triggerGetWindowNameForDocking();
	});
	$("#Windows").append(getWindowNameForDocking);
	const getWindowTitle = $("<getWindowTitle>Get Window Title</getWindowTitle><br/>");
	getWindowTitle.click(function () {
		triggerGetWindowTitle();
	});
	$("#Windows").append(getWindowTitle);
	const estHeaderCommandChannel = $("<estHeaderCommandChannel>Establish Header Command Channel</estHeaderCommandChannel><br/>");
	estHeaderCommandChannel.click(function () {
		triggerEstHeaderCommandChannel();
	});
	$("#Windows").append(estHeaderCommandChannel);
	const injectHeader = $("<injectHeader>Inject Header</injectHeader><br/>");
	injectHeader.click(function () {
		triggerInjectHeader();
	});
	$("#Windows").append(injectHeader);
	const maximize = $("<maximize>Maximize</maximize><br/>");
	maximize.click(function () {
		triggerMaximize();
	});
	$("#Windows").append(maximize);
	const minimize = $("<minimize>Minimize</minimize><br/>");
	minimize.click(function () {
		triggerMinimize();
	});
	$("#Windows").append(minimize);
	const restore = $("<restore>Restore</restore><br/>");
	restore.click(function () {
		triggerRestore();
	});
	$("#Windows").append(restore);
	const sendWinIdentifierForTilingOrTabbing = $("<sendWinIdentifierForTilingOrTabbing>Send Window Identifier For Tiling or Tabbing</sendWinIdentifierForTilingOrTabbing><br/>");
	sendWinIdentifierForTilingOrTabbing.click(function () {
		triggerSendWinIdentifierForTilingOrTabbing();
	});
	$("#Windows").append(sendWinIdentifierForTilingOrTabbing);
	const setAlwaysOnTop = $("<setAlwaysOnTop>Set Always On Top</setAlwaysOnTop><br/>");
	setAlwaysOnTop.click(function () {
		triggerSetAlwaysOnTop();
	});
	$("#Windows").append(setAlwaysOnTop);
	const setWindowTitle = $("<setWindowTitle>Set Window Title</setWindowTitle><br/>");
	setWindowTitle.click(function () {
		triggerSetWindowTitle();
	});
	$("#Windows").append(setWindowTitle);
	const showAtMousePos = $("<showAtMousePos>Show At Mouse Position</showAtMousePos><br/>");
	showAtMousePos.click(function () {
		triggerShowAtMousePos();
	});
	$("#Windows").append(showAtMousePos);
	const startTilingOrTabbing = $("<startTilingOrTabbing>Start Tiling Or Tabbing</startTilingOrTabbing><br/>");
	startTilingOrTabbing.click(function () {
		triggerStartTilingOrTabbing();
	});
	$("#Windows").append(startTilingOrTabbing);
	const stopTilingOrTabbing = $("<stopTilingOrTabbing>Stop Tiling Or Tabbing</stopTilingOrTabbing><br/>");
	stopTilingOrTabbing.click(function () {
		triggerStopTilingOrTabbing();
	});
	$("#Windows").append(stopTilingOrTabbing);

	/* Dialog Buttons */
	const openDialog = $("<openDialog>Open Dialog</openDialog><br/>");
	openDialog.click(function () {
		triggerOpenDialog();
	});
	$("#Dialog").append(openDialog);

	/* Search Client Buttons */
	const search = $("<search>search</search><br/>");
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
				setDisplayMsg('Search success with the following details.', response)
			}
		})
	else
		setDisplayMsg('Input a search value in the textbox at the top.')
}

/* Dialog manager functions */
function triggerOpenDialog() {
	let dialogParams = {
		question: 'Test Question. See response in console.',
		affirmativeResponseText: 'Yes, overwrite',
		negativeResponseText: 'No, cancel',
		includeNegative: true,
		includeCancel: false
	};
	FSBL.Clients.DialogManager.open('yesNo', dialogParams, function (err, response) {
		//choice can be `'affirmative'`, `'negative'`, or `'cancel'`.
		if (!err)
			setDisplayMsg("Response Received: " + response.choice)
	});
}

/* WindowClient functions */
function triggerStopTilingOrTabbing() {
	var windowIdentifier = FSBL.Clients.WindowClient.getWindowIdentifier()
	FSBL.Clients.WindowClient.stopTilingOrTabbing({
		windowIdentifier: windowIdentifier
	}, function (err) {
		if (!err) {
			setDisplayMsg('stopTilingOrTabbing Stopped.')
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
			setDisplayMsg('startTilingOrTabbing Started.')
		}
	})
}

function triggerShowAtMousePos() {
	FSBL.Clients.WindowClient.showAtMousePosition()
}

function triggerSetWindowTitle() {
	if (document.getElementById('symbolInput').value != ''){
		FSBL.Clients.WindowClient.setWindowTitle(document.getElementById('symbolInput').value)
		setDisplayMsg('setWindowTitle Successed.')
	}else
		setDisplayMsg('Input a title in the textbox at the top.')
}

function triggerSetAlwaysOnTop() {
	FSBL.Clients.WindowClient.setAlwaysOnTop(true, function (err) {
		if (!err) {
			setDisplayMsg('setAlwaysOnTop Successed.')
		}
	})
}

function triggerSendWinIdentifierForTilingOrTabbing() {
	var windowIdentifier = FSBL.Clients.WindowClient.getWindowIdentifier()
	FSBL.Clients.WindowClient.sendIdentifierForTilingOrTabbing({
		windowIdentifier: windowIdentifier
	}, function (err) {
		if (!err) {
			setDisplayMsg('sendIdentifierForTilingOrTabbing Successed.')
		}
	})
}

function triggerRestore() {
	FSBL.Clients.WindowClient.restore(function (err) {
		if (!err) {
			setDisplayMsg('restore Successed.')
		}
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
			setDisplayMsg('removeComponentState Successed.')
		}
	})
}

function triggerMinimize() {
	FSBL.Clients.WindowClient.minimize(function (err) {
		if (!err) {
			setDisplayMsg('minimize Successed.')
		}
	})
}

function triggerMaximize() {
	FSBL.Clients.WindowClient.maximize(function (err) {
		if (!err) {
			setDisplayMsg('maximize Successed.')
		}
	})
}

function triggerInjectHeader() {
	FSBL.Clients.WindowClient.injectHeader({}, function (err) {
		setDisplayMsg('injectHeader Successed.')
	})
}

function triggerEstHeaderCommandChannel() {
	FSBL.Clients.WindowClient.headerCommandChannel(function (err, header) {
		setDisplayMsg('triggerHeaderCommandChannel successed.', header, true)
	})
	setDisplayMsg('triggerEstHeaderCommandChannel successed.')
}

function triggerGetWindowTitle() {
	var windowTitle = FSBL.Clients.WindowClient.getWindowTitle()
	if (windowTitle)
		setDisplayMsg('getWindowTitle Successed. Window Title: ' + windowTitle)
}

function triggerGetWindowNameForDocking() {
	var windowName = FSBL.Clients.WindowClient.getWindowNameForDocking()
	if (windowName) {
		setDisplayMsg('getWindowNameForDocking Successed. Window Name: ' + windowName)
	}
}

function triggerGetWindowIdentifier() {
	var windowIdentifier = FSBL.Clients.WindowClient.getWindowIdentifier()
	if (windowIdentifier) {
		setDisplayMsg('getWindowIdentifier Successed.', windowIdentifier)
	}
}

function triggerGetWindowsGroup() {
	var windowGroups = FSBL.Clients.WindowClient.getWindowGroups()
	if (windowGroups) {
		setDisplayMsg('getWindowGroups Successed.', windowGroups)
	}
}

function triggerGetStackedWindow() {
	FSBL.Clients.WindowClient.getStackedWindow({}, function (err, stackedWindow) {
		if (!err) {
			setDisplayMsg('triggerGetStackedWindow Successed. ', stackedWindow)
		}
	})
}

function triggerGetSpawnData() {
	var spawnData = FSBL.Clients.WindowClient.getSpawnData()
	if (spawnData) {
		setDisplayMsg('Successed.', spawnData)
	}
}

function triggerGetCurWin() {
	var currentWindow = FSBL.Clients.WindowClient.getCurrentWindow()
	if (currentWindow) {
		setDisplayMsg('Successed.', currentWindow)
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
					setDisplayMsg('setComponentState Successed.')
				}
			})
	else
		setDisplayMsg('Input a value in the textbox at the top.')
}

function triggerGetComponentState() {
	FSBL.Clients.WindowClient.getComponentState({
		fields: ['testField1', 'testField2']
	}, function (err, state) {
		if (!err) {
			setDisplayMsg('getComponentState Successed.', state)
		}else
			setDisplayMsg('getComponentState err',err)
		
	})
}

function triggerGetBounds() {
	FSBL.Clients.WindowClient.getBounds(function (err, bounds) {
		if (!err) {
			setDisplayMsg('Successed.', bounds)
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
		if (!err) {
			setDisplayMsg('triggerFitToDom Successed.')
		}
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
			setDisplayMsg('cancelTilingOrTabbing Successed.')
		}
	})
}

function triggerBringWindowToFront() {
	FSBL.Clients.WindowClient.bringWindowToFront()
	setDisplayMsg('bringWindowToFront Successed.')
}

/* Storage client functions */
function triggerGetStorageValue() {
	FSBL.Clients.StorageClient.get({
		topic: "finsemble",
		key: "testKey"
	}, function (err, val) {
		if (!err) {
			setDisplayMsg('Topic: finsemble, Key: testKey, value: ' + val)
		}
	})
}

function triggerGetStorageKeys() {
	FSBL.Clients.StorageClient.keys({
		topic: "finsemble"
	}, function (err, keys) {
		if (!err) {
			setDisplayMsg('Successed. Check latest key and value in indexedDB for detail. (Developer Tools->Application->Storage->IndexedDB->fsbl)', keys)
		}
	})
}

function triggerRemoveStorageValue() {
	FSBL.Clients.StorageClient.remove({
		topic: "finsemble",
		key: "testKey"
	}, function (err) {
		if (!err)
			setDisplayMsg('Successed. Check latest key and value in indexedDB for detail. (Developer Tools->Application->Storage->IndexedDB->fsbl)')
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
				setDisplayMsg('Successed. Check latest key and value in indexedDB for detail. (Developer Tools->Application->Storage->IndexedDB->fsbl)')
		})
	else
		setDisplayMsg('Input a value in the textbox at the top.')
}

function triggerSetStorageStore() {
	FSBL.Clients.StorageClient.setStore({
		topic: "local",
		dataStore: "LocalStorageAdapter"
	}, function (err) {
		if (!err)
			setDisplayMsg('Successed. Check latest key and value in indexedDB for detail. (Developer Tools->Application->Storage->IndexedDB->fsbl)')
	})
}

function triggerSetStorageUser() {
	FSBL.Clients.StorageClient.setUser({
		user: 'testUser'
	}, function (err) {
		if (!err)
			setDisplayMsg('Successed. Check latest key and value in indexedDB for detail. (Developer Tools->Application->Storage->IndexedDB->fsbl) After checking, please reset using "Reset" in the function menu otherwise other functions may not work properly.')
	})
}

/* Distributed store client functions */
function triggerSetStoreValue(field) {
	if (document.getElementById('symbolInput').value != '')
		if (dsStore)
			dsStore.setValue({
				field: field,
				value: document.getElementById('symbolInput').value
			}, function (err) {
				setDisplayMsg('Value set for ' + field)
			})
	else
		setDisplayMsg('Please create distributed store.')
	else
		setDisplayMsg('Input a value in the textbox at the top.')
}

function triggerGetStoreValue() {
	if (dsStore)
		dsStore.getValue({
			field: 'field1'
		}, function (err, value) {
			setDisplayMsg('Field1: ' + value)
		})
	else
		setDisplayMsg('Please create distributed store.')
}

function triggerRemoveStore() {
	FSBL.Clients.DistributedStoreClient.removeStore({
		store: 'testDs1',
	}, function (err) {
		if (!err)
			setDisplayMsg('testDs1 removed.')
		else
			setDisplayMsg('No such store.')
	})
}

function triggerGetStore() {
	FSBL.Clients.DistributedStoreClient.getStore({
		store: 'testDs1',
	}, function (err, store) {
		if (!err) {
			setDisplayMsg('GetStore Successed.', store)
		} else
			setDisplayMsg('No such store.')
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
			setDisplayMsg('testDs1 created.', store)
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
				setDisplayMsg('Switched.')
			}
		})
	else
		setDisplayMsg('Input a name in the textbox at the top.')
}

function triggerSaveAsWorkspace() {
	if (document.getElementById('symbolInput').value != '')
		FSBL.Clients.WorkspaceClient.saveAs({
			name: document.getElementById('symbolInput').value
		}, function (err, response) {
			if (!err) {
				setDisplayMsg('Saved.')
			}
		})
	else
		setDisplayMsg('Input a name in the textbox at the top.')
}

function triggerSaveWorkspace() {
	FSBL.Clients.WorkspaceClient.save(function (err, response) {
		if (!err) {
			setDisplayMsg('Saved.')
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
						setDisplayMsg('rename current workspace Successed.')
					}
				})
			}
		})
	else
		setDisplayMsg('Input a name in the textbox at the top.')
}

function triggerRemoveWorkspace() {
	if (document.getElementById('symbolInput').value != '')
		FSBL.Clients.WorkspaceClient.remove({
			name: document.getElementById('symbolInput').value
		}, function (err, response) {
			if (!err) {
				setDisplayMsg('remove workspace Successed.')
			} else {
				setDisplayMsg('Workspace not found.')
			}
		})
	else
		setDisplayMsg('Input a name in the textbox at the top.')
}

function triggerMinimizeAll() {
	FSBL.Clients.WorkspaceClient.minimizeAll({}, function (err) {
		if (!err) {
			setDisplayMsg('minimizeAll successed.')
		}
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
							setDisplayMsg('import Successed.')
					})
				}
			})
		}
	})
}

function triggerGetWorkspaces() {
	FSBL.Clients.WorkspaceClient.getWorkspaces(function (err, response) {
		if (!err) {
			setDisplayMsg('getWorkspaces Successed.', response)
		}
	})
}

function triggerGetActiveWorkspace() {
	FSBL.Clients.WorkspaceClient.getActiveWorkspace(function (err, response) {
		if (!err) {
			setDisplayMsg('Successed.', response)
		}
	})
}

function triggerExportWorkspace() {
	if (document.getElementById('symbolInput').value != '')
		FSBL.Clients.WorkspaceClient.export({
			workspaceName: document.getElementById('symbolInput').value
		}, function (err, workspaceDefinition) {
			if (!err) {
				setDisplayMsg('Workspace definition exported.', workspaceDefinition)
			}
		})
	else
		setDisplayMsg('Input a name in the textbox at the top.')
}

function triggerCreateWorkspace() {
	if (document.getElementById('symbolInput').value != '')
		FSBL.Clients.WorkspaceClient.createWorkspace(document.getElementById('symbolInput').value, {}, function (err, response) {
			if (!err) {
				setDisplayMsg('createWorkspace successed', response)
			}
		})
	else
		setDisplayMsg('Input a name in the textbox at the top.')
}

function triggerBringWinsToFront() {
	FSBL.Clients.WorkspaceClient.bringWindowsToFront({}, function (err, response) {
		setDisplayMsg('bringWindowsToFront successed', response)
	})
}

function triggerAutoArrange() {
	FSBL.Clients.WorkspaceClient.autoArrange({}, function (err, response) {
		if(!err)
			setDisplayMsg('autoArrange successed',response)
	})
}

/* Router client functions */
function triggerDisconnectAll() {
	FSBL.Clients.RouterClient.disconnectAll()
	setDisplayMsg('Disconnected all.')
}

function triggerTransmit() {
	if (document.getElementById('symbolInput').value != '') {
		FSBL.Clients.RouterClient.transmit('symbol', {
			'data': document.getElementById('symbolInput').value
		})
		setDisplayMsg('Transmitted.')
	} else {
		setDisplayMsg('Input a value in the textbox at the top.')
	}
}

function triggerQuery() {
	FSBL.Clients.RouterClient.query("symbol", {
		queryKey: "abc123"
	}, {
		timeout: 1000
	}, function (error, queryResponseMessage) {
		if (!error) {
			// process income query response message
			setDisplayMsg("Router client query respond: " + queryResponseMessage.data)
		} else {
			setDisplayMsg("Please add a Router Responder in 'API Test 2' component.")
		}
	});
}

function triggerPublish() {
	if (document.getElementById('symbolInput').value != '') {
		FSBL.Clients.RouterClient.publish('symbol', {
			'symbol': document.getElementById('symbolInput').value
		})
		setDisplayMsg('Published.')
	} else {
		setDisplayMsg('Input a value in the textbox at the top.')
	}
}

function triggerRemovePubSubResponder() {
	FSBL.Clients.RouterClient.removePubSubResponder('symbol')
	setDisplayMsg("Pubsub responder removed.")
}

function triggerAddPubSubResponder() {
	FSBL.Clients.RouterClient.addPubSubResponder("symbol", {
		"State": "start"
	}, {
		subscribeCallback: subscribeCallback,
		publishCallback: publishCallback,
		unsubscribeCallback: unsubscribeCallback
	});
	setDisplayMsg("Pubsub responder added.")
}

function subscribeCallback(error, subscribe) {
	if (subscribe) {
		// must make this callback to accept or reject the subscribe (default is to accept). First parm is err and second is the initial state
		setDisplayMsg(subscribe.header.origin + ' subscribed topic ' + subscribe.header.topic, null, true)
		subscribe.sendNotifyToSubscriber(null, {
			"NOTIFICATION-STATE": "One"
		});
	}
}

function publishCallback(error, publish) {
	if (publish) {
		// must make this callback to send notify to all subscribers (if error parameter set then notify will not be sent)
		setDisplayMsg(publish.header.origin + ' published topic ' + publish.header.topic, null, true)
		publish.sendNotifyToAllSubscribers(null, publish.data);
	}
}

function unsubscribeCallback(error, unsubscribe) {
	if (unsubscribe) {
		// must make this callback to acknowledge the unsubscribe
		setDisplayMsg(unsubscribe.header.origin + ' unsubscribed topic ' + unsubscribe.header.topic, null, true)
		unsubscribe.removeSubscriber();
	}
}

/* Logger client functions */
function triggerWarn() {
	FSBL.Clients.Logger.warn('APITEST_LOGGER_MSG, This is a warn message')
}

function triggerVerbose() {
	FSBL.Clients.Logger.verbose('APITEST_LOGGER_MSG, This is a verbose message')
}

function triggerLog() {
	FSBL.Clients.Logger.log('APITEST_LOGGER_MSG, This is a log message')
}

function triggerInfo() {
	FSBL.Clients.Logger.info('APITEST_LOGGER_MSG, This an info message')
}

function triggerError() {
	FSBL.Clients.Logger.error('APITEST_LOGGER_MSG, This is an error message')
}

function triggerDebug() {
	FSBL.Clients.Logger.debug('APITEST_LOGGER_MSG, This is a debug message')
}

/* Linker client functions */
function triggerLinkerPub() {
	if (document.getElementById('symbolInput').value != '')
		FSBL.Clients.LinkerClient.publish({
			dataType: "symbol",
			data: document.getElementById('symbolInput').value
		}, function (err) {
			if (!err) {
				setDisplayMsg('Published.')
			}
		})
	else
		setDisplayMsg('Input a value in the textbox at the top.')
}

function triggerOpenLinkerWindow() {
	FSBL.Clients.LinkerClient.openLinkerWindow(function (err) {
		alert('er')
		if (!err) {
			setDisplayMsg('Opened linker window.')
		}else{
			setDisplayMsg('openLinkerWindow Err', err)
		}
	})
}

function triggerStartOnStateChange() {
	FSBL.Clients.LinkerClient.onStateChange(function (err, response) {
		if (!err) {
			setDisplayMsg("Linker state changed.", response, true)
		}
	})
	setDisplayMsg('Callback function set for onLinkerStateChanged.')
}

function triggerLinkToGroup1() {
	FSBL.Clients.LinkerClient.linkToChannel("group1", null, function (err, channel) {
		if (!err) {
			setDisplayMsg('Linked to group1.', channel)
		}
	})
}

function triggerUnlinkToGroup1() {
	FSBL.Clients.LinkerClient.unlinkFromChannel("group1", null, function (err, channel) {
		if (!err) {
			setDisplayMsg('Unlinked to group1.', channel)
		}
	})
}

function triggerGetState() {
	FSBL.Clients.LinkerClient.getState(FSBL.Clients.WindowClient.getWindowIdentifier, function (err, state) {
		if (!err) {
			setDisplayMsg('Get state succeed.', state)
		}
	})
}

function triggerGetWinLinkedCurWindow() {
	FSBL.Clients.LinkerClient.getLinkedWindows(FSBL.Clients.WindowClient.getWindowIdentifier, function (err, windows) {
		if (!err) {
			setDisplayMsg(windows.length + ' windows linked with current component.', windows)
		}
	})
}

function triggerGetWinLinkedGroup1() {
	FSBL.Clients.LinkerClient.getLinkedWindows({
		channels: ['group1']
	}, function (err, windows) {
		if (!err) {
			setDisplayMsg(windows.length + ' windows linked with Group1.', windows)
		}
	})
}

function triggerGetComLinkedCurWindow() {
	FSBL.Clients.LinkerClient.getLinkedComponents(FSBL.Clients.WindowClient.getWindowIdentifier, function (err, components) {
		if (!err) {
			setDisplayMsg(components.length + ' components linked with current component.', components)
		}
	})
}

function triggerGetComLinkedGroup1() {
	FSBL.Clients.LinkerClient.getLinkedComponents({
		channels: ['group1']
	}, function (err, components) {
		if (!err) {
			setDisplayMsg(components.length + ' components linked with Group1.', components)
		}
	})
}

function triggerGetAllChannels() {
	FSBL.Clients.LinkerClient.getAllChannels(function (err, channels) {
		if (!err) {
			setDisplayMsg(channels.length + ' Linker channels found.', channels)
		}
	})
}


/* Launcher client functions */
function triggerGetActiveDescriptors() {
	FSBL.Clients.LauncherClient.getActiveDescriptors(function (err, desc) {
		if (!err) {
			setDisplayMsg('There are ' + Object.keys(desc).length + ' window descriptors.', desc)
		}
	})
}

function triggerGetComponentDefaultConfig() {
	FSBL.Clients.LauncherClient.getComponentDefaultConfig('API Test 1', function (err, config) {
		if (!err) {
			setDisplayMsg('"API Test 1" component found.', config)
		}
	})
}

function triggerGetComponentList() {
	FSBL.Clients.LauncherClient.getComponentList(function (err, componentList) {
		if (!err) {
			setDisplayMsg('Component list found.', componentList)
		}
	})
}

function triggerGetComponentsThatCanReceiveDataTypes() {
	//This function cooperate with field "advertiseReceivers" in component.json which should be deprecated
	FSBL.Clients.LauncherClient.getComponentsThatCanReceiveDataTypes({
		dataTypes: ['symbol']
	}, function (err, componentList) {
		if (!err) {
			setDisplayMsg('Component list found.', componentList)
		}
	})
}

function triggerGetMonitorInfo() {
	FSBL.Clients.LauncherClient.getMonitorInfo({}, function (err, monitorList) {
		if (!err) {
			setDisplayMsg('Monitor list found.', monitorList)
		}
	})
}

function triggerGetMonitorInfoAll() {
	FSBL.Clients.LauncherClient.getMonitorInfoAll(function (err, monitorList) {
		if (!err) {
			setDisplayMsg('Monitor list found.', monitorList)
		}
	})
}

function triggerGetMyWindowIdentifier() {
	//Should the cb able to return 'err'?
	FSBL.Clients.LauncherClient.getMyWindowIdentifier(function (windowIdentifer) {
		if (windowIdentifer) {
			setDisplayMsg('Window Identifer found.', windowIdentifer)
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
			setDisplayMsg("Registered Component.")
		}
	})
}

function triggerUnregisterComponent() {
	FSBL.Clients.LauncherClient.unRegisterComponent({
		componentType: 'testRegisterComponent'
	}, function (err) {
		if (!err) {
			setDisplayMsg("Unregistered Component.")
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
				setDisplayMsg('Spawn error')
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
				setDisplayMsg("Window can only shown once.")
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
	if (!err)
		setDisplayMsg("Pressed Global Ctrl + Q");
}

function onGlobalHotkeyRegistered(err, response) {
	if (!err)
		setDisplayMsg("Registered global hotkey Ctrl + Q");
}

function onGlobalHotkeyUnregistered(err, response) {
	if (!err)
		setDisplayMsg("Unregistered global hotkey Ctrl + Q");
}

/* Local Hotkey functions*/
function registerLocalHotkey() {
	const keys = [keyMap.ctrl, keyMap.q];
	FSBL.Clients.HotkeyClient.addLocalHotkey(keys, onLocalHotkeyTriggered, onLocalHotkeyRegistered);
}

function onLocalHotkeyTriggered(err, response) {
	if (!err)
		setDisplayMsg("Pressed local Ctrl + Q");
}

function onLocalHotkeyRegistered(err, response) {
	if (!err)
		setDisplayMsg("Registered local hotkey Ctrl + Q");
}

function unregisterLocalHotkey() {
	const keys = [keyMap.ctrl, keyMap.q];
	FSBL.Clients.HotkeyClient.removeLocalHotkey(keys, onLocalHotkeyTriggered, onLocalHotkeyUnregistered);
}

function onLocalHotkeyUnregistered(err, response) {
	if (!err)
		setDisplayMsg("Unregistered local hotkey Ctrl + Q");
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
	return document.getElementById('symbolInput').value
}

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", FSBLReady);
} else {
	window.addEventListener("FSBLReady", FSBLReady);
}

function setDisplayMsg(msg, respondObj, append) {
	if (append)
		document.getElementById('displayMsg').value += '\n\n' + msg + '\n\n'
	else
		document.getElementById('displayMsg').value = msg + '\n\n'
	if (respondObj)
		document.getElementById('displayMsg').value += JSON.stringify(respondObj, null, "\t");
}

function FSBLReady() {
	renderPage();
	setupEmitter();
}