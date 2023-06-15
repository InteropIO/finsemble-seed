/**
 * Preload for PDF Js app.
 *
 * Fetches spawn data opens the pdf url contained in the spawn data
 * Adds an FDC3 context listener for "custom.pdf" allowing components linked to same channel to share pdf files
 * Stores opened urls in component state allowing users who persist the pdfjs viewer to keep the same pdf open in the
 * next session
 *
 */


const STATE_TOPIC_URL = 'pdfUrl';
let currrentUrl = null;

const loadURL = function (url) {
	if (currrentUrl === url) {
		FSBL.Clients.Logger.log("Skipping load, current URL already loaded: " + url);
	} else {
		FSBL.Clients.Logger.log("Loading URL: " + url);
		currrentUrl = url;
		PDFViewerApplication.open({url});
		FSBL.Clients.WindowClient.setComponentState({field: STATE_TOPIC_URL, value: url});
	}
	FSBL.Clients.WindowClient.bringToFront();
};

const contextHandler = function (context) {
	//Support linker messages on the url and pdf channels
	if (context && (context.url)) {
		FSBL.Clients.Logger.log("Got linker data URL: " + context.url);
		loadURL(context.url);
	} else {
		FSBL.Clients.Logger.error("No PDF URL to load from linker");
	}
};

const setupContextSharing = function () {
	//register linker topics
	fdc3.addContextListener("custom.pdf", contextHandler)
};

const init = function () {
	fdc3.addIntentListener("ViewPdf", contextHandler)
	//Check for existing component state
	let state = FSBL.Clients.WindowClient.getComponentState(
		{ field: STATE_TOPIC_URL	},
		function (err, state) {
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

const fdc3Action = () => {
	try {
		init();
		setupContextSharing();
	} catch (e) {
		FSBL.Clients.Logger.error(e);
	}
}

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("fdc3Ready", fdc3Action)
} else {
	window.addEventListener("FSBLReady", fdc3Action)
}
