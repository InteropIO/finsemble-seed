function init() {
	console.log("Initialising child window overrides now")
	let data = FSBL.Clients.WindowClient.getSpawnData();
	if (data) {
		console.log("got data: ", data);
		for (const key in data) {
			if (data.hasOwnProperty(key)) {
				window[key] = data[key];
			}
		}
	} else {
		console.log("no spawn data to get :-(");
	}

	document.querySelector('#set').removeEventListener('click', window.setData);

	document.querySelector('#set').addEventListener('click', window.mySetData);

}

window.mySetData = function(e) {
	this.childValue = document.querySelector('#childvalue').value;
	FSBL.Clients.RouterClient.query(window.channelName, this.childValue, function(error, queryResponseMessage) {
		if (error) {
			console.log('query failed: ' + JSON.stringify(error));
		} else {
			console.log('query response: ' + JSON.stringify(queryResponseMessage));
		}
	});
}

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener('onReady', init);
} else {
	window.addEventListener('FSBLReady', init);
}