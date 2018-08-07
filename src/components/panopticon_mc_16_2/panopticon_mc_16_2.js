let fsblReady = false;
let DatawatchApi;

let Logger = FSBL.Clients.Logger;

function setTitle(){
	DatawatchApi.getSelectedWorkbook(function(dashboard) {
		if (dashboard) {
			console.log("Setting title using dashboard", dashboard);
			FSBL.Clients.WindowClient.setWindowTitle(dashboard);
		} else {
			DatawatchApi.getSelectedWorkbook(function(workbook) {
				if (workbook) {
					console.log("Setting title using workbook", dashboard);
					FSBL.Clients.WindowClient.setWindowTitle(workbook);
				} else {
					FSBL.Clients.WindowClient.setWindowTitle("Panopticon");
				}
			});
		}
	});
}

function listenForLinkedParameters() {
	DatawatchApi.getDashboardParameters(null, function(params) {
		console.log("Dashboard parameters: ", params);
		for (let i = 0; i < params.length; i++) {
			let paramName = params[i].Name;
			console.log("Subscribing to parameter: " + paramName);
            FSBL.Clients.LinkerClient.subscribe(paramName, function(data){
				console.log("New parameter received (type=" + paramName + "): " + data);
				let toSet = {};
				toSet[paramName] = data;
				DatawatchApi.setDashboardParameters(toSet);
			});
        }
		
		//TODO: figure out if we need to read current parameters and set the full set
		// 	DatawatchAPI.setDashboardParameters({
		// 		"ParamName": "Some value",
		// 		"ParamName2": "Some value 2"
		//     }, "Some Dashboard Name", onNavigationCompleted);

	});
}

function listenForParameterChanges() {
	DatawatchApi.addParametersChangedListener(function(parameters) {
		console.log("Dashboard parameters changed: ", parameters);
	});
}

function setState() {
	let state = {
		workbook: null,
		dashboard: null,
		parameters: null
	};
	function save(state) {
		console.log("saving state: ", state);
		FSBL.Clients.WindowClient.setComponentState({ field: 'state', value: state });
	};
	DatawatchAPI.getSelectedWorkbook(function(workbookName) {
		if (dashboardName) {
			state.dashboard = workbookName;
			DatawatchAPI.getSelectedDashboard(function(dashboardName) {
				if (dashboardName) {
					state.dashboard = dashboardName;
					DatawatchAPI.getDashboardParameters(function(dashParams) {
						if (dashboardName) {
							state.parameters = dashParams;
						} 
						save(state);
					});
				} else {
					save(state);				}
			});
		} else {
			save(state);
		}
	});
}

function getState(cb) {
	FSBL.Clients.WindowClient.getComponentState({
		field: 'state',
	}, function (err, state) {
		if (state === null) {
			cb();
		}
		console.log("got state: ", state);
		DatawatchApi.navigate(state, cb);
	});
}

function doSetup() {
	if (DatawatchApi && fsblReady) {
		console.log("Doing setup");
		setTitle();
		listenForLinkedParameters();
		listenForParameterChanges();
		setState();
	} else {
		console.log("NOT doing setup. DatawatchApi: ", DatawatchApi);
	}
}

FSBL.addEventListener('onReady', function () {
	fsblReady = true;
	DatawatchApi = window.DatawatchAPI;
	console.log("FSBL ready");

	getState(function() {
		doSetup();
	});

});