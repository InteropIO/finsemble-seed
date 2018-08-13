let DatawatchApi;
let Logger = FSBL.Clients.Logger;
let state = {
	workbook: null,
	dashboard: null,
	parameters: null
};
let subscriptions = {};
let dragAndDropSubscriptions = {};
let setup = false;

function setTitle(){
	if (state.dashboard) {
		Logger.log("Setting title using workbook & dashboard: " + state.workbook + ": " + state.dashboard);
		FSBL.Clients.WindowClient.setWindowTitle(state.workbook + ": " + state.dashboard);
	} else {
		if (state.workbook) {
			Logger.log("Setting title using workbook only", state.workbook);
			FSBL.Clients.WindowClient.setWindowTitle(state.workbook);
		} else {
			Logger.log("Setting default title");
			FSBL.Clients.WindowClient.setWindowTitle("Panopticon");
		}
	}
}

function loadStateFromPage(cb) {
	DatawatchApi.getSelectedWorkbook(function(workbookName) {
		if (workbookName) {
			state.workbook = workbookName;
			DatawatchApi.getSelectedDashboard(function(dashboardName) {
				if (dashboardName) {
					state.dashboard = dashboardName;
					
					DatawatchApi.getDashboardParameters(null, function(dashParams) {
						if (dashParams && dashParams.length) {
							let stateParams = {};
							for (let p=0; p < dashParams.length; p++) {
								stateParams[dashParams[p].Name] = dashParams[p].Value;
							}
							state.parameters = stateParams;
						} 
						cb();
					});
				} else {
					cb();				
				}
			});
		} else {
			cb();
		}
	});
}

function setState(cb) {
	Logger.log("saving state: ", state);
	FSBL.Clients.WindowClient.setComponentState({ field: 'state', value: state });
	if(cb) { cb(); }
}

function getState(cb) {
	let didUpdate = false;
		
	FSBL.Clients.WindowClient.getComponentState({
		field: 'state',
	}, function (err, savedState) {
		if (!savedState || !savedState.workbook) {
			Logger.log("No saved state returned: ", savedState);
			cb(didUpdate);
		} else {
			Logger.log("got saved state: ", savedState);
			if (state.workbook != savedState.workbook) { state.workbook = savedState.workbook; didUpdate = true; };
			if (state.dashboard != savedState.dashboard) { state.dashboard = savedState.dashboard; didUpdate = true; };
			//if we haven't got parameters but savedState does
			if ((!(state.parameters && typeof state.parameters === 'object')) && (savedState.parameters && typeof savedState.parameters === 'object')) { 
				state.parameters = savedState.parameters; didUpdate = true; 
			} //if both we and saved state have parameters
			else if (state.parameters && typeof state.parameters === 'object' && savedState.parameters && typeof savedState.parameters === 'object'){ 
				//remove any values not in saved state
				for (var key of Object.keys(state.parameters)) {
					let value = state.parameters[key];
					if (!savedState.parameters.hasOwnProperty(key)) {
						state.parameters[key] = null; // TODO: check if this should be undefined
						didUpdate = true;
					}
				}
				//set any new values
				for (var key of Object.keys(savedState.parameters)) {
					let value = savedState.parameters[key];
					if (!state.parameters.hasOwnProperty(key) || (state.parameters.hasOwnProperty(key) && state.parameters[key] != value)) {
						state.parameters[key] = value;
						didUpdate = true;
					}
				}	
			}
			//report back on whether we changed anything
			if (didUpdate) {
				Logger.log("Updated internal state: ", state);
			} else {
				Logger.log("Internal state not updated: ", state);
			}
			cb(didUpdate);
		}
	});
}

function setParameterHandler(err, response) {
	if (!err && response.data) {
		for ([key, value] of response.data) {
			state.parameters[key] = value;
		}
		DatawatchApi.setDashboardParameters(state.parameters);
		setState();
	};
}

function setParameterLinkerHandler(data){
	Logger.log("New parameter received (type=" + paramName + "): " + data);
	state.parameters[paramName] = data;
	DatawatchApi.setDashboardParameters(state.parameters);
	setState();
}


function listenForLinkedOrDroppedParameters() {
	Logger.log("Dashboard parameters: ", params);
	let receivers = [];
	let newSubscriptions = {};
	let paramKeys = Object.keys(state.parameters);
	for (let i = 0; i < paramKeys.length; i++) {
		let paramName = paramKeys[i];
		
		if (subscriptions[paramName]){
			Logger.log("Already subscribed to Linker parameter: " + paramName);
		} else {
			Logger.log("Subscribing to Linker parameter: " + paramName);
			//linker subscribe
			FSBL.Clients.LinkerClient.subscribe(paramName, setParameterLinkerHandler);
			subscriptions[paramName] = true;
		}

		//subscribe for drag and drop
		if (dragAndDropSubscriptions[paramName]){
			Logger.log("Already subscribed to Drag & Drop parameter: " + paramName);
		} else {
			Logger.log("Subscribing to Drag & Drop parameter: " + paramName);
			dragAndDropSubscriptions[paramName] = true;
			receivers.push({type: paramName, handler: setParameterHandler});
		}

		newSubscriptions[paramName] = true;
	}

	if(receivers.length > 0) {
		FSBL.Clients.DragAndDropClient.addReceivers({
			receivers: receivers
		});
	}

	if (Object.keys(subscriptions).length > Object.keys(newSubscriptions).length){
		//do some unsubscriptions
		let keys = Object.keys(subscriptions);
		for (let i = 0; i < keys.length; i++) {
			if (!newSubscriptions[keys[i]]) {
				Logger.log("Unsubscribing from parameter: " + keys[i]);
				FSBL.Clients.LinkerClient.unsubscribe(keys[i]);
				//can't unsubscribe from drag and drop
			}
		}
	}
	subscriptions = newSubscriptions;

	//Panopticon will happily accept a single parameter at a time and only update that value
	//TODO: Need to figure out how to set to default / reset
}

function listenForParameterChanges() {
	DatawatchApi.addParametersChangedListener(function(parameters) {
		console.log("Dashboard parameters changed: ", parameters);
		loadStateFromPage(function() {
			setState();
		});
	});
}

function listenForDashboardChanges() {
	DatawatchApi.addDashboardChangedListener(function(dashboardName) {
		Logger.log("Switched to dashboard: " + dashboardName);
		loadStateFromPage(function() {
			setTitle();
			listenForLinkedOrDroppedParameters();
			setState();
		});
	});
}

function doSetup() {
	if(!setup){
		setup = true;
		Logger.log("Doing setup");
		function completeSetup() {
			setTitle();
			setState();
			listenForLinkedOrDroppedParameters();
			listenForParameterChanges();
			listenForDashboardChanges();
		}
		DatawatchApi = window.DatawatchAPI;
		if (DatawatchApi) {
			loadStateFromPage(function () {
				Logger.log("Loaded state from page: ", state);
				getState(function(didUpdate) {
					if (didUpdate) {
						Logger.log("State updated from saved version, completing setup");
						DatawatchApi.navigate(state, function() {
							completeSetup();
						});
					}  else{
						Logger.log("Correct state loaded, completing setup");
						completeSetup();
					}
				});
			});
		} else {
			Logger.log("DatawatchAPI not present - skipping the rest of setup");
		}
	} else {
		Logger.log("Skipped setup - already performed");
	}
}


let windowLoaded = false;
window.onload = function() {
	Logger.log("window.onload");
	windowLoaded = true;
	if (FSBLLoaded && windowLoaded){
		doSetup();
	}
};

let FSBLLoaded = false;
// FSBL.addEventListener('onReady', function () {
window.addEventListener("FSBLReady", function () {
	Logger.log("FSBL.onReady");
	FSBLLoaded = true;
	if (FSBLLoaded && windowLoaded){
			doSetup();
	}
});