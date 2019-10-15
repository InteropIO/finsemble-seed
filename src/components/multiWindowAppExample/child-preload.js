function init() {
	FSBL.Clients.WindowClient.getSpawnData((err, data) => {
		if (data) {
			//
			console.log("got data: ", data);
			for (const key in data) {
				if (data.hasOwnProperty(key)) {
					window[key] = data[key];
				}
			}
		}
	})
}

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener('onReady', init);
} else {
	window.addEventListener('FSBLReady', init);
}