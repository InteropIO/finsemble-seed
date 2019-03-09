const FSBLReady = () => {
	try {
		// Do things with FSBL in here.
		let data = FSBL.Clients.WindowClient.getSpawnData();
		if (data && data.url) {
			console.log("Got data URL: " + data.url);
			let spawnUrl = window.location.href + "#" + data.url;
			console.log("Redirecting to: " + data.url);
			window.location.href = spawnUrl;
		}
	} catch (e) {
		FSBL.Clients.Logger.error(e);
	}
}

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", FSBLReady)
} else {
	window.addEventListener("FSBLReady", FSBLReady)
}