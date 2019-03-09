


const FSBLReady = () => {
	try {
		FSBL.Clients.WindowClient.setWindowTitle(document.title);
		// create an observer instance
		var observer = new MutationObserver(function(mutations) {
			// We need only first event and only new value of the title
			FSBL.Clients.WindowClient.setWindowTitle(document.title);
		});
		// configuration of the observer:
		var config = { subtree: true, characterData: true };
		// pass in the target node, as well as the observer options
		observer.observe(document.title, config);
		
		//Check for a URL to load
		let data = FSBL.Clients.WindowClient.getSpawnData();
		if (data && data.url) {
			console.log("Got data URL: " + data.url);
			PDFViewerApplication.open(data.url);
		} else {
			console.log("No PDF URL to load");
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