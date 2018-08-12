let DatawatchApi;
let Logger = FSBL.Clients.Logger;
let state = {
	workbook: null,
	dashboard: null,
	parameters: null
};
let setup = false;

function setTitle(){
	DatawatchApi.getSelectedWorkbook(function(dashboard) {
		if (dashboard) {
			Logger.log("Setting title using dashboard", dashboard);
			FSBL.Clients.WindowClient.setWindowTitle(dashboard);
		} else {
			DatawatchApi.getSelectedWorkbook(function(workbook) {
				if (workbook) {
					Logger.log("Setting title using workbook", dashboard);
					FSBL.Clients.WindowClient.setWindowTitle(workbook);
				} else {
					FSBL.Clients.WindowClient.setWindowTitle("Panopticon");
				}
			});
		}
	});
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
			cb(didUpdate);
		}
		Logger.log("got saved state: ", savedState);
		if (state.workbook != savedState.workbook) { state.workbook = savedState.workbook; didUpdate = true;};
		if (state.dashboard != savedState.dashboard) { state.dashboard = savedState.dashboard; didUpdate = true;};
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

function listenForLinkedOrDroppedParameters() {
	DatawatchApi.getDashboardParameters(null, function(params) {
		Logger.log("Dashboard parameters: ", params);
		let receivers = [];
		for (let i = 0; i < params.length; i++) {
			let paramName = params[i].Name;
			receivers.push({type: paramName, handler: setParameterHandler});
			Logger.log("Subscribing to parameter: " + paramName);
            FSBL.Clients.LinkerClient.subscribe(paramName, function(data){
				Logger.log("New parameter received (type=" + paramName + "): " + data);
				state.parameters[paramName] = data;
				DatawatchApi.setDashboardParameters(state.parameters);
				setState();
			});
        }
		
		FSBL.Clients.DragAndDropClient.addReceivers({
			receivers: receivers
		});

		//Panopticon will happily accept a single parameter at a time and only update that value
		//TODO: Need to figure out how to set to default / reset
	});
}

function listenForParameterChanges() {
	DatawatchApi.addParametersChangedListener(function(parameters) {
		console.log("Dashboard parameters changed: ", parameters);
	});
}


function doSetup() {
	if(!setup){
		setup = true;
		Logger.log("Doing setup");
		function completeSetup() {
			setTitle();
			listenForLinkedOrDroppedParameters();
			listenForParameterChanges();
			setState();
		}
		DatawatchApi = window.DatawatchAPI;
		if (DatawatchApi) {
			loadStateFromPage(function () {
				Logger.log("Loaded state from page: ", state);
				getState(function(didUpdate) {
					if (didUpdate) {
						DatawatchApi.navigate(state, function() {
							completeSetup();
						});
					}  else{
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


count = 0;
FSBL.addEventListener('onReady', function () {
	count = count + 1;
	Logger.log("FSBL.onReady " + count);
	doSetup();
});