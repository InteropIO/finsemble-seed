agGrid.LicenseManager.setLicenseKey("");

var columnDefs = [
	// these are the row groups, so they are all hidden (they are show in the group column)
	{
		headerName: 'Message Id',
		field: 'messageCounter',
		hide: false,
		width: 110
	},
	{
		headerName: 'Message Source',
		field: 'source',
		hide: false,
		width: 150
	},
	{
		headerName: 'Message Generate Time',
		field: 'dt',
		hide: false,
		width: 200,
		cellRenderer: (data) => {
			return formatDate(data.data.dt);
		}
	},
	{
		headerName: ' Message Receive Time',
		field: 'newdt',
		hide: false,
		width: 200,
		cellRenderer: (data) => {
			return formatDate(data.data.newdt);
		}
	},
	{
		headerName: 'Latency (ms)',
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
	autoGroupColumnDef: {
		width: 200
	},
	onGridReady: function (params) {

	},
	getRowNodeId: function (data) {
		return data.messageCounter;
	}
};

const formatDate = (date) => {
	let tempDate = new Date(date);
	return tempDate.getHours() + ':' + tempDate.getMinutes() + ":" + tempDate.getSeconds() + ":" + tempDate.getMilliseconds()
}

const FSBLReady = () => {
	try {
		//Create the ag-grid
		var eGridDiv = document.querySelector('#msgGrid');
		new agGrid.Grid(eGridDiv, gridOptions);
		gridOptions.api.setRowData([]);

		let localCounter = 0;
		let receiverStartTime;
		let startMsg
		let diffTotal

		//RouterClient Test Receiver
		FSBL.Clients.RouterClient.addListener("RouterTestChannel", (err, message) => {
			let testRecord = message.data;
			if (!Array.isArray(testRecord)) {
				if (testRecord.testState === "start") {
					startMsg = testRecord
					gridOptions.api.setRowData([]);
					document.getElementById('result').innerHTML = ''
					localCounter = 0;
					diffTotal = 0
					receiverStartTime = new Date();
				} else if (testRecord.testState === "done") {
					let endTime = new Date();
					let totalTime = endTime - startMsg.senderStartTime;
					//let localTotalTime = endTime - receiverStartTime;
					let messagesPerSecond = (Math.round((localCounter / totalTime) * 1000 * 100) / 100).toFixed(2);
					let averageDiff = (Math.round((diffTotal / localCounter) * 100) / 100).toFixed(2);
					let bandwidth =  (Math.round(((localCounter* startMsg.dataSize)/totalTime *1000) * 100) / 100).toFixed(2);
					let result = 'Total Message Recevied: ' + localCounter + '<br/>' + 'Total Time: ' + totalTime + ' ms<br/>' + 'Number of Message per Second: ' + messagesPerSecond + '<br/>' + 'Latency: ' + averageDiff + ' ms<br/>' + 'Bandwidth: ' + bandwidth + ' bytes/s<br/>'
					document.getElementById('result').innerHTML = result
				}
			} else {
				if (testRecord[0].testState === "continuing") {
					testRecord.forEach(record => {
						localCounter++;
						record.newdt = new Date().getTime()
						record.dtdiff = record.newdt - record.dt
						diffTotal += record.dtdiff
						var res = gridOptions.api.updateRowData({
							add: [record]
						});
					})
				}
			}
		});

		//DistributedStore Test Receiver
		FSBL.Clients.DistributedStoreClient.getStore({
				store: 'testDs'
			},
			function (err, storeObject) {
				if (err != null) {
					console.log(err)
				} else {
					storeObject.addListener({
						field: 'data'
					}, (err, data) => {
						let testRecord = data.value;
						if (!Array.isArray(testRecord)) {
							if (testRecord.testState === "start") {
								startMsg = testRecord
								gridOptions.api.setRowData([]);
								document.getElementById('result').innerHTML = ''
								localCounter = 0;
								diffTotal = 0
								receiverStartTime = new Date();
							} else if (testRecord.testState === "done") {
								if (localCounter > 0) {
									let endTime = new Date();
									let totalTime = endTime - startMsg.senderStartTime;
									let localTotalTime = endTime - receiverStartTime;
									let messagesPerSecond = (Math.round((localCounter / totalTime) * 1000 * 100) / 100).toFixed(2);
									let averageDiff = (Math.round((diffTotal / localCounter) * 100) / 100).toFixed(2);
									let result = 'Total Message Recevied: ' + localCounter + '<br/>' + 'Total Time: ' + totalTime + ' ms<br/>' + 'Total Local Time: ' + localTotalTime + ' ms<br/>' + 'Number of Message per Second: ' + messagesPerSecond + '<br/>' + 'Latency: ' + averageDiff + ' ms<br/>'
									document.getElementById('result').innerHTML = result
								}
							}
						} else {
							if (testRecord[0].testState === "continuing") {
								testRecord.forEach(record => {
									localCounter++;
									record.newdt = new Date().getTime()
									record.dtdiff = record.newdt - record.dt
									diffTotal += record.dtdiff
									var res = gridOptions.api.updateRowData({
										add: [record]
									});
								})
							}
						}
					}, () => {

					})
				}
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