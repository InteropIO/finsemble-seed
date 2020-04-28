// Please include your own ag-grid license ley 
agGrid.LicenseManager.setLicenseKey("");

var columnDefs = [
	// these are the row groups, so they are all hidden (they are show in the group column)
	{
		headerName: 'Symbol',
		field: 'symbol',
		hide: false
	},
	{
		headerName: 'price',
		field: 'price',
		hide: false
	},
	{
		headerName: 'Date Time (ms)',
		field: 'dt',
		hide: false,
		width: 180
	},
	{
		headerName: 'Receive Date Time (ms)',
		field: 'newdt',
		hide: false,
		width: 180
	},
	{
		headerName: 'Diff (ms)',
		field: 'dtdiff',
		hide: false,
		width: 100
	}
];

var gridOptions = {
	defaultColDef: {
		filter: "true", // set filtering on for all cols
		width: 120,
		sortable: true,
		resizable: true
	},
	floatingFilter: true,
	columnDefs: columnDefs,
	suppressAggFuncInHeader: true,
	animateRows: true,
	getRowNodeId: function (data) {
		return data.trade;
	},
	autoGroupColumnDef: {
		width: 200
	},
	onGridReady: function (params) {

	},
	onCellDoubleClicked: function (event) {
		cellDoubleClickEventHandler(event);
	}
};

const cellDoubleClickEventHandler = (event) => {
	FSBL.Clients.LauncherClient.showWindow({
		componentType: "demoComponent2"
	}, {
		spawnIfNotFound: true,
		left: "adjacent",
		data: event.data
	}, () => {
		FSBL.Clients.RouterClient.transmit("demoTransmitChannel1", event.data);
	});
}

const onNewData = (data) => {
	data.newdt = new Date().getTime()
	data.dtdiff = data.newdt - data.dt
	var res = gridOptions.api.updateRowData({
		add: [data]
	});
}

const onHistoryDatas = (data) => {
	var res = gridOptions.api.setRowData(data);
}

const FSBLReady = () => {
	try {
		//Create the ag-grid
		var eGridDiv = document.querySelector('#myGrid');
		new agGrid.Grid(eGridDiv, gridOptions);

		// Query history data
		FSBL.Clients.RouterClient.query("demoServiceResponder", {
			"action": 'getHistoryData'
		}, function (error, response) {
			if (!error) {
				onHistoryDatas(response.data);
			} else {
				FSBL.Clients.Logger.error(error)
			}
		});

		// Listen to demoDataStreamChannel
		FSBL.Clients.RouterClient.addListener("demoDataStreamChannel", function (error, response) {
			if (!error) {
				onNewData(response.data)
			} else {
				FSBL.Clients.Logger.error(error)
			}
		});
	} catch (e) {
		FSBL.Clients.Logger.error(e);
	}
}

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", FSBLReady)
} else {
	window.addEventListener("FSBLReady", FSBLReady)
}