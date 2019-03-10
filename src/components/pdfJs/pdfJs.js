


const FSBLReady = () => {
	try {
		//observe page title to set window title on PDF load
		const target = document.querySelector('title');
		const config = {
			attributes: true,
			attributeOldValue: true,
			characterData: true,
			characterDataOldValue: true,
			childList: true,
			subtree: true
		};
		function subscriber(mutations) {
			mutations.forEach((mutation) => {
				FSBL.Clients.WindowClient.setWindowTitle(mutation.target.textContent);
			});
		}
		const observer = new MutationObserver(subscriber);
		observer.observe(target, config);
		
		//Check for a URL to load in spawn data
		let spawndata = FSBL.Clients.WindowClient.getSpawnData();
		if (spawndata && spawndata.url) {
			FSBL.Clients.Logger.log("Got spawn data URL: " + spawndata.url);
			PDFViewerApplication.open(spawndata.url);
			FSBL.Clients.WindowClient.setWindowTitle(document.title);
		} else {
			console.log("No PDF URL to load from spawn data");
		}
		
		//Support linker messages on the url and pdf channels
		let linkerHandler = function(linkerdata){
			if (linkerdata && (linkerdata.url || linkerdata.pdf)) {
				let url = linkerdata.url ? linkerdata.url : linkerdata.pdf;
				FSBL.Clients.Logger.log("Got linker data URL: " + url);
				PDFViewerApplication.open(url);
				FSBL.Clients.WindowClient.setWindowTitle(document.title);
			} else {
				console.log("No PDF URL to load from linker");
			}
		};
		FSBL.Clients.LinkerClient.subscribe("url", linkerHandler);
		FSBL.Clients.LinkerClient.subscribe("pdf", linkerHandler);
	
		//support Drag and Drop
		FSBL.Clients.DragAndDropClient.addReceivers({
			receivers: [
				{
					type: 'pdf',
					handler: function (err, response) {
						if (!err) { linkerHandler(response.data); }
					}
				},
				{
					type: 'url',
					handler: function (err, response) {
						if (!err) { linkerHandler(response.data); }
					}
				}
			]
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