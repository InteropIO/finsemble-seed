
// This global will contain our current zoom level
window.fsblZoomLevel = 1;

// Sets the zoom by setting the CSS "zoom" value on the body
// It sets an opposing zoom on the Finsemble header in order that it maintains its size
function setZoom(pct) {
	document.querySelectorAll("body > *").forEach(function (el) {
		el.style.zoom = pct;
	});
	//document.body.style.zoom = pct;
	let FSBLHeader = document.querySelector("#FSBLHeader");
	if (FSBLHeader) {
		FSBLHeader.style.zoom = 1;
		//document.body.style.zoom = 1/pct;
	}
}

// Zoom in. Zoom levels are saved as component state "fsbl-zoom"
function zoomIn() {
	window.fsblZoomLevel += 0.1;
	setZoom(window.fsblZoomLevel);
	FSBL.Clients.WindowClient.setComponentState({ field: "fsbl-zoom", value: window.fsblZoomLevel });
}

function zoomOut() {
	window.fsblZoomLevel -= 0.1;
	setZoom(window.fsblZoomLevel);
	FSBL.Clients.WindowClient.setComponentState({ field: "fsbl-zoom", value: window.fsblZoomLevel });
}

// Startup, attaches ctrl+ and ctrl- as hot keys
// Checks for an existing zoom state and initializes the screen to that zoom level if set
function runZoomHandler() {
	FSBL.Clients.HotkeyClient.addBrowserHotkey(["ctrl", "="], zoomIn);
	FSBL.Clients.HotkeyClient.addBrowserHotkey(["ctrl", "-"], zoomOut);
	FSBL.Clients.WindowClient.getComponentState({ field: "fsbl-zoom" }, function (err, state) {
		if (state != null) {
			window.fsblZoomLevel = state;
			setZoom(window.fsblZoomLevel);
		}
	});
};

// TODO, catch and recall scroll position

// Startup pattern for preload. Preloads can come in any order, so we need to wait on either the window event or the FSBL event
if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", runZoomHandler);
} else {
	window.addEventListener("FSBLReady", runZoomHandler);
}
