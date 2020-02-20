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
		left: "adjacent"
	}, ()=>{
		FSBL.Clients.RouterClient.transmit("demoTransmitChannel1", event.data);
	});
}

const demoItem1Updated = (err, data) => {
	data.value.newdt = new Date().getTime()
	data.value.dtdiff = data.value.newdt-data.value.dt
	var res = gridOptions.api.updateRowData({
		add: [data.value]
	});
}

const FSBLReady = () => {
	try {
		//Create the ag-grid
		var eGridDiv = document.querySelector('#myGrid');
		new agGrid.Grid(eGridDiv, gridOptions);

		//Get the global distributed store
		FSBL.Clients.DistributedStoreClient.getStore({
				store: "demoStore"
			},
			function (err, storeObject) {
				//Add listener to the store
				storeObject.addListeners(
					[{
						field: "demoItem1",
						listener: demoItem1Updated
					}],
					null,
					() => {
						//CB after listener added
					}
				);
			}
		);
	} catch (e) {
		FSBL.Clients.Logger.error(e);
	}
}

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", FSBLReady)
} else {
	window.addEventListener("FSBLReady", FSBLReady)
}