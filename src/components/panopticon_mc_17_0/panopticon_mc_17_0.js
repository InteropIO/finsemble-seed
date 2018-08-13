let panopticonApi;
let Logger = FSBL.Clients.Logger;
let state = {
	workbookName: null,
	dashboardName: null,
	parameters: null
};
let subscriptions = {};
let dragAndDropSubscriptions = {};
let setup = false;

function setTitle(){
	if (state.dashboardName) {
		Logger.log("Setting title using dashboard: " + state.dashboardName);
		FSBL.Clients.WindowClient.setWindowTitle(state.dashboardName);
	} else {
		if (state.workbookName) {
			Logger.log("Setting title using workbook only", state.workbookName);
			FSBL.Clients.WindowClient.setWindowTitle(state.workbookName);
		} else {
			Logger.log("Setting default title");
			FSBL.Clients.WindowClient.setWindowTitle("Panopticon");
		}
	}
}

function loadStateFromPage(cb) {
	var workbook = panopticonApi.getCurrentWorkbook();
	Logger.info("Got workbook: ", workbook);
	console.info("Got workbook: ", workbook);
	if (workbook) {
		var workbookName = workbook.workbookName;
		state.workbookName = workbookName;

		var dashboard = workbook.dashboards.filter(function (dash) {
			return dash.selected;
		})[0];
		if (dashboard) {
			state.dashboardName = dashboard.dashboardName
			if (dashboard.parameters && dashboard.parameters.length) {
				let stateParams = {};
				for (let p=0; p < dashboard.parameters.length; p++) {
					stateParams[dashboard.parameters[p].name] = {
						name: dashboard.parameters[p].name,
						type: dashboard.parameters[p].type,
						value: dashboard.parameters[p].value
					}
				}
				state.parameters = stateParams;
			} 
			cb();
		} else {
			cb();				
		}
		
	} else {
		cb();
	}
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
		if (!savedState || !savedState.workbookName) {
			Logger.log("No saved state returned: ", savedState);
			cb(didUpdate);
		} else {
			Logger.log("got saved state: ", savedState);
			if (state.workbook != savedState.workbookName) { state.workbookName = savedState.workbookName; didUpdate = true; };
			if (state.dashboard != savedState.dashboardName) { state.dashboardName = savedState.dashboardName; didUpdate = true; };
			//if we haven't got parameters but savedState does
			if ((!(state.parameters && typeof state.parameters === 'object')) && (savedState.parameters && typeof savedState.parameters === 'object')) { 
				state.parameters = savedState.parameters; didUpdate = true; 
			} //if both we and saved state have parameters
			else if (state.parameters && typeof state.parameters === 'object' && savedState.parameters && typeof savedState.parameters === 'object'){ 
				//remove any values not in saved state
				for (var key of Object.keys(state.parameters)) {
					// let value = state.parameters[key];
					if (!savedState.parameters.hasOwnProperty(key)) {
						delete state.parameters[key];
						didUpdate = true;
					}
				}
				//set any new values
				for (var key of Object.keys(savedState.parameters)) {
					let savedParam = savedState.parameters[key];
					if (!state.parameters.hasOwnProperty(key) || (state.parameters.hasOwnProperty(key) && state.parameters[key].value != savedParam.value)) {
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

function dragAndDropHandler(err, response) {
	if (!err && response.data) {
		for ([key, value] of response.data) {
			state.parameters[key] = value;
		}
		panopticonApi.setDashboardParameters(state.parameters);
		setState();
	};
}

function linkerHandler(data){
	Logger.log("New parameter received (type=" + paramName + "): " + data);
	state.parameters[paramName] = data;
	panopticonApi.setDashboardParameters(state.parameters);
	setState();
}


function listenForLinkedOrDroppedParameters() {
	let newSubscriptions = {};
	if (state.parameters && Object.keys(state.parameters).length) {
		Logger.log("Doing linker and drag and drop subscriptions");
		let receivers = [];
		let paramKeys = Object.keys(state.parameters);
		for (let i = 0; i < paramKeys.length; i++) {
			let paramName = paramKeys[i];
			
			if (subscriptions[paramName]){
				Logger.log("Already subscribed to Linker parameter: " + paramName);
			} else {
				Logger.log("Subscribing to Linker parameter: " + paramName);
				//linker subscribe
				FSBL.Clients.LinkerClient.subscribe(paramName, linkerHandler);
				subscriptions[paramName] = true;
			}

			//subscribe for drag and drop
			if (dragAndDropSubscriptions[paramName]){
				Logger.log("Already subscribed to Drag & Drop parameter: " + paramName);
			} else {
				Logger.log("Subscribing to Drag & Drop parameter: " + paramName);
				dragAndDropSubscriptions[paramName] = true;
				receivers.push({type: paramName, handler: dragAndDropHandler});
			}

			newSubscriptions[paramName] = true;
		}

		if(receivers.length > 0) {
			FSBL.Clients.DragAndDropClient.addReceivers({
				receivers: receivers
			});
		}

	} else {
		Logger.log("No parameters to subscribe to");
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
	panopticonApi.addParameterListener(function(event) {
		console.log("Dashboard parameters changed: ", event.parameters);
		let stateParams = {};
		for (let p=0; p < event.parameters.length; p++) {
			stateParams[event.parameters[p].Name] = event.parameters[p].Value;
		}
		state.parameters = stateParams;
		setState();
	});
}

function listenForDashboardChanges() {
	function onDashboardChange(event){
		console.log("Dashboard changed: ", event.dashboardName, event.parameters);
		state.dashboardName = event.dashboardName;
		let stateParams = {};
		for (let p=0; p < event.parameters.length; p++) {
			stateParams[event.parameters[p].Name] = event.parameters[p].Value;
		}
		state.parameters = stateParams;
		setState();
		setTitle();
		listenForLinkedOrDroppedParameters();
   }
   panopticonApi.addDashboardListener(onDashboardChange);
}

function doSetup() {
	if(!setup){
		setup = true;
		Logger.log("Doing setup");
		console.log("Doing setup");
		function completeSetup() {
			setTitle();
			setState();
			listenForLinkedOrDroppedParameters();
			listenForParameterChanges();
			listenForDashboardChanges();
		}
		panopticonApi = window.PanopticonApi;
		if (panopticonApi) {
			loadStateFromPage(function () {
				Logger.log("Loaded state from page: ", state);
				getState(function(didUpdate) {
					if (didUpdate) {
						Logger.log("State updated from saved version, completing setup");

						let navOptions = {
							workbookName: state.workbookName,
							dashboardName: state.dashboardName,
							parameters: []
						}
						if (state.parameters && Object.keys(state.parameters).length) {
							navOptions.parameters = Object.values(state.parameters);
						}
						panopticonApi.navigate(navOptions, function() {
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

let FSBLLoaded = false;
let windowLoaded = false;
FSBL.addEventListener('onReady', function () {
//window.addEventListener("FSBLReady", function () {
	Logger.log("FSBL.onReady");
	console.log("FSBL.onReady");
	FSBLLoaded = true;
	// if (FSBLLoaded && windowLoaded){
		doSetup();
	// }
});


// let onWindowLoad = function() {
// 	Logger.log("window.onload");
// 	console.log("window.onload");
// 	windowLoaded = true;
// 	if (FSBLLoaded && windowLoaded){
// 		doSetup();
// 	}
// };
// window.addEventListener('load', onWindowLoad, false);
