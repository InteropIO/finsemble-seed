function init() {
	console.log("Initialising child window overrides")
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

}

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener('onReady', init);
} else {
	window.addEventListener('FSBLReady', init);
}