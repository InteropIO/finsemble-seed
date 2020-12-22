let panopticonApi;
let Logger;
let state = {
	workbookName: undefined,
	dashboardName: undefined,
	parameters: undefined
};
let subscriptions = {};
let dragAndDropSubscriptions = {};
let setup = false;

//We may need to translate symbol names used in other components to those used in Panopticon demo dashboard.
const INCOMING_NAME_TRANSLATIONS = {
	"symbol": "sym"
}
const OUTGOING_NAME_TRANSLATIONS = {
	"sym": "symbol"
}
function translateParamName(name, translation) {
	return translation[name] ? translation[name] : name;
}

function log() {
	Logger.log(...arguments);
	console.log(...arguments);
}

/**
 * Use state information to set the Finsemble Window title
 */
function setTitle() {
	if (state.dashboardName) {
		log("Setting title using dashboard: " + state.dashboardName);
		FSBL.Clients.WindowClient.setWindowTitle("Panopticon: " + state.dashboardName);
	} else {
		if (state.workbookName) {
			log("Setting title using workbook only", state.workbookName);
			FSBL.Clients.WindowClient.setWindowTitle("Panopticon: " + state.workbookName);
		} else {
			log("Setting default title");
			FSBL.Clients.WindowClient.setWindowTitle("Panopticon");
		}
	}
}

/**
 * Retrieves the current panopticon state from the Panopticon API
 * @param function cb Called when state has been loaded.
 */
function loadStateFromPanoticonAPI(cb) {
	var workbook = panopticonApi.getCurrentWorkbook();
	log("Got workbook: ", workbook);
	if (workbook) {
		var workbookName = workbook.workbookName;
		state.workbookName = workbookName;

		var dashboard = workbook.dashboards.filter(function (dash) {
			return dash.selected;
		})[0];
		if (dashboard) {
			log("Got dashboard: ", dashboard);
			state.dashboardName = dashboard.dashboardName
			if (dashboard.parameters && dashboard.parameters.length) {
				let stateParams = {};
				for (let p = 0; p < dashboard.parameters.length; p++) {
					stateParams[dashboard.parameters[p].name] = dashboard.parameters[p];
				}
				state.parameters = stateParams;
				log("Got parameters: ", stateParams);
			}
			cb();
		} else {
			log("No selected dashboard");
			cb();
		}

	} else {
		cb();
	}
}

/**
 * Saves the current state into the Finsemble workspace.
 * @param function cb Called when done.
 */
function setState(cb) {
	log("saving state: ", state);
	FSBL.Clients.WindowClient.setComponentState({ field: 'state', value: state });
	if (cb) { cb(); }
}

/**
 * Retrieves any state in the Finsemble workspace.
 * @param function cb Called with a single argument indicating if the saved state
 * differed from the current state (loaded from the Panopticon API).
 */
function getState(cb) {
	let didUpdate = false;

	FSBL.Clients.WindowClient.getComponentState({
		field: 'state',
	}, function (err, savedState) {
		if (!savedState || !savedState.workbookName) {
			log("No saved state returned: ", savedState);
			cb(didUpdate);
		} else {
			log("got saved state: ", savedState);
			if (state.workbook != savedState.workbookName) {
				state.workbookName = savedState.workbookName;
				didUpdate = true;
			};
			if (state.dashboard != savedState.dashboardName) { 
				state.dashboardName = savedState.dashboardName; 
				didUpdate = true; };
			//if we haven't got parameters but savedState does
			if ((!(state.parameters && typeof state.parameters === 'object')) && (savedState.parameters && typeof savedState.parameters === 'object')) {
				state.parameters = savedState.parameters;
				didUpdate = true;
			} //if both we and saved state have parameters
			else if (state.parameters && typeof state.parameters === 'object' && savedState.parameters && typeof savedState.parameters === 'object') {
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
						state.parameters[key] = savedParam;
						didUpdate = true;
					}
				}
			}
			//report back on whether we changed anything
			if (didUpdate) {
				log("Updated internal state: ", state);
			} else {
				log("Internal state not updated: ", state);
			}
			cb(didUpdate);
		}
	});
}

/**
 * Applies the current state via the Panopticon API
 * @param function cb Called when done 
 */
function applyState(cb) {
	let navOptions = {
		workbookName: state.workbookName,
		dashboardName: state.dashboardName,
		parameters: []
	}
	if (state.parameters && Object.keys(state.parameters).length) {
		navOptions.parameters = Object.values(state.parameters);
	}
	log("navigating panopticon with options: ", navOptions);
	panopticonApi.navigate(navOptions, function () {
		if (cb) { cb(); }
	});

	//TODO: add linker publish of parameters
	
}

/**
 * Handler function for drag and drop.
 * @param {*} err 
 * @param {*} response 
 */
function dragAndDropHandler(err, response) {
	if (!err && response.data) {
		for ([key, value] of response.data) {
			state.parameters[key] = value;
		}
		applyState(setState);
	};
}

/**
 * Handler function for incoming linker shares
 * @param {*} paramName 
 * @param {*} type 
 * @param {*} data 
 */
function linkerHandler(paramName, type, data) {
	log("New parameter received (type=" + paramName + "): " + data);
	state.parameters[paramName] = {name: paramName, type: type, value: data};
	applyState(setState);
}

/**
 * Sets up linker and drag and drop handler for the dashboards parameters.
 */
function listenForLinkedOrDroppedParameters() {
	log("Setting up linker and drag and drop handlers");
	let newSubscriptions = {};
	if (state.parameters && Object.keys(state.parameters).length) {
		let receivers = [];
		let paramKeys = Object.keys(state.parameters);
		for (let i = 0; i < paramKeys.length; i++) {
			let paramName = paramKeys[i];

			if (subscriptions[paramName]) {
				log("Already subscribed to Linker parameter: " + paramName);
			} else {
				log("Subscribing to Linker parameter: " + paramName);
				//linker subscribe
				FSBL.Clients.LinkerClient.subscribe(
					//listen to the translated parameter name, but use the dashboards native name for the parameter otherwise
					translateParamName(paramName, OUTGOING_NAME_TRANSLATIONS),
					(err, response) => {
						//Uncomment if you don't want the dashboard to receive its own parameter back
						//  you often DO want it to also set that parameter on itself 
						// (which is a separate action otherwise)
						//if (!response.originatedHere()) {
							linkerHandler(paramName, state.parameters[paramName].type, response.data);
						//}
					});
				subscriptions[paramName] = true;
			}

			//subscribe for drag and drop
			if (dragAndDropSubscriptions[paramName]) {
				log("Already subscribed to Drag & Drop parameter: " + paramName);
			} else {
				log("Subscribing to Drag & Drop parameter: " + paramName);
				dragAndDropSubscriptions[paramName] = true;
				//receive the translated parameter name, but use the dashboards native name for the parameter otherwise
				receivers.push({ type: translateParamName(paramName, OUTGOING_NAME_TRANSLATIONS), handler: dragAndDropHandler });
			}

			newSubscriptions[paramName] = true;
		}

		if (receivers.length > 0) {
			FSBL.Clients.DragAndDropClient.addReceivers({
				receivers: receivers
			});
		}

	} else {
		log("No parameters to set up listeners for");
	}

	if (Object.keys(subscriptions).length > Object.keys(newSubscriptions).length) {
		//do some unsubscriptions
		let keys = Object.keys(subscriptions);
		for (let i = 0; i < keys.length; i++) {
			if (!newSubscriptions[keys[i]]) {
				log("Unsubscribing from parameter: " + keys[i]);
				FSBL.Clients.LinkerClient.unsubscribe(keys[i]);
				//can't unsubscribe from drag and drop
			}
		}
	}
	subscriptions = newSubscriptions;

	//Panopticon will happily accept a single parameter at a time and only update that value
	//TODO: Need to figure out how to set to default / reset
}

/**
 * Uses the Panopticon API to listen for any parameter changes in the dashboard,
 * update state in the Finsemble workspace and maintain any linker or drag and drop
 * listeners.
 */
function listenForParameterChanges() {
	log("Setting up parameter listener");
	panopticonApi.addParameterListener(function (event) {
		log("Dashboard parameters changed: ", event.parameters);
		let stateParams = {};
		for (let p = 0; p < event.parameters.length; p++) {
			stateParams[event.parameters[p].name] = event.parameters[p];
		}
		state.parameters = stateParams;
		setState();
	});
}

/**
 * Uses the Panopticon API to listen for any changes to the selected dashboard,
 * update state in the Finsemble workspace and maintain any linker or drag and drop
 * listeners.
 */
function listenForDashboardChanges() {
	function onDashboardChange(event) {
		log("Dashboard changed: ", event.dashboardName, event.parameters);
		state.dashboardName = event.dashboardName;
		let stateParams = {};
		for (let p = 0; p < event.parameters.length; p++) {
			stateParams[event.parameters[p].name] = event.parameters[p];
		}
		state.parameters = stateParams;
		setState();
		setTitle();
		listenForLinkedOrDroppedParameters();
	}
	log("Setting up dashboard listener");
	panopticonApi.addDashboardListener(onDashboardChange);
}

/**
 * Setup all Finsemble API integrations.
 */
function doSetup() {
	if (!setup) {
		setup = true;
		function handleState() {
			getState(function (didUpdate) {
				if (didUpdate) {
					log("State updated from saved version, completing setup");
					applyState(completeSetup);
				} else {
					log("Correct state already loaded, completing setup");
					completeSetup();
				}
			});
		};
		function completeSetup() {
			setTitle();
			setState();
			listenForLinkedOrDroppedParameters();
			listenForParameterChanges();
			listenForDashboardChanges();
		};
		Logger = FSBL.Clients.Logger;
		panopticonApi = window.PanopticonApi;
		if (panopticonApi) {
			loadStateFromPanoticonAPI(function () {
				log("Loaded state from page: ", state);
				if (state.dashboardName) {
					handleState();
				} else {
					//Panopticon may need to load before setting a dashboard name, if so try again in a second
					log("Deferring setup a little to let Panopticon startup complete");
					let retries =0;
					let interval = setInterval(() => {
						loadStateFromPanoticonAPI(() => {
							retries++;
							if (state.dashboardName || retries == 10){
								clearInterval(interval)
								log("Loaded state from page: ", state);
								handleState();
							}
						})
					}, 1000);
				}
			});
		} else {
			log("Panopticon not present - skipping the rest of setup");
		}
	} else {
		log("Skipped setup - already performed");
	}
}

let FSBLLoaded = false;

const init = () => {
	FSBLLoaded = true;
	doSetup();
};

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener('onReady', init);
} else {
	window.addEventListener('FSBLReady', init);
};
