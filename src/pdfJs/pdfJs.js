
const STATE_TOPIC_URL = 'pdfUrl';
let currrentUrl = null;

const observeDocumentTitle = function(){
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
};

const loadURL = function(url) {
	if (currrentUrl == url) {
		FSBL.Clients.Logger.log("Skipping load, current URL already loaded: " + url);
	} else {
		FSBL.Clients.Logger.log("Loading URL: " + url);
		currrentUrl = url;
		PDFViewerApplication.open(url);
		FSBL.Clients.WindowClient.setComponentState({ field: STATE_TOPIC_URL, value: url });
	}
	FSBL.Clients.WindowClient.bringWindowToFront();
};

const incomingContextHandler = function(linkerData){
	//Support linker messages on the url and pdf channels
	if (linkerData && (typeof linkerData == "string" || linkerData.url || linkerData.pdf)) {
		let linkerUrl = typeof linkerData == "string" ? linkerData : 
						linkerData.url ? linkerData.url : linkerData.pdf;
		FSBL.Clients.Logger.log("Got linker data URL: " + linkerUrl);
		loadURL(linkerUrl);
	} else {
		FSBL.Clients.Logger.error("No PDF URL to load from linker");
	}
};

const setupContextSharing = function (){
	//register linker topics
	FSBL.Clients.LinkerClient.subscribe("url", incomingContextHandler);
	FSBL.Clients.LinkerClient.subscribe("pdf", incomingContextHandler);

	//support Drag and Drop
	FSBL.Clients.DragAndDropClient.addReceivers({
		receivers: [
			{
				type: 'pdf',
				handler: function (err, response) {
					if (!err) { incomingContextHandler(response.data); }
					else { FSBL.Clients.Logger.error("Error on drag and drop (pdf): ", err); }
				}
			},
			{
				type: 'url',
				handler: function (err, response) {
					if (!err) { incomingContextHandler(response.data); }
					else { FSBL.Clients.Logger.error("Error on drag and drop (url): ", err); }
				}
			}
		]
	});
};

const init = function (){
	//Check for existing component state
	let state = 
	FSBL.Clients.WindowClient.getComponentState({
		field: STATE_TOPIC_URL,
	}, function (err, state) {
		if (err || !state) {
			//Check for a URL to load in spawn data
			let spawndata = FSBL.Clients.WindowClient.getSpawnData();
			if (spawndata && spawndata.url) {
				FSBL.Clients.Logger.log("Got spawn data URL: " + spawndata.url);
				loadURL(spawndata.url);
			} else {
				FSBL.Clients.Logger.warning("No PDF URL to load from state or spawn data");
			}
		} else {
			//load URL from state
			FSBL.Clients.Logger.log("Got PDF URL from workspace state: " + state);
			loadURL(state);
		}
	});
}

const FSBLReady = () => {
	try {
		observeDocumentTitle();
		init();
		setupContextSharing();
	} catch (e) {
		FSBL.Clients.Logger.error(e);
	}
}

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", FSBLReady)
} else {
	window.addEventListener("FSBLReady", FSBLReady)
}