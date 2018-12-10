
// This global will contain our current zoom level
window.fsblZoomLevel = 1;

// Global variable with the timeout for the zoom
window.zoomTimeout = 1000;
window.zoomStep = 0.1;
window.zoomMin = 0.2;
window.zoomMax = 5;

// Sets the zoom by setting the CSS "zoom" value on the body
// It sets an opposing zoom on the Finsemble header in order that it maintains its size
function setZoom(pct) {
	// enforce min/max zoom
	if (pct < window.zoomMin) {
		pct = window.zoomMin;
	} else if (pct > window.zoomMax) {
		pct = window.zoomMax;
	}

	document.querySelectorAll("body > *").forEach(function (el) {
		el.style.zoom = pct;
	});

	const FSBLHeader = document.querySelector("#FSBLHeader");
	if (FSBLHeader) {
		FSBLHeader.style.zoom = 1;
	}

	const popup = document.querySelector("#zoom-popup");
	if (popup) {
		popup.style.zoom = 1;

		const span = document.querySelector("#zoom-popup-text");
		span.innerHTML = `${Math.floor(pct * 100)}%`

		popup.style.display = "block";

		if (window.timerHandle) {
			// Clear timer to reset hide timeout
			clearTimeout(window.timerHandle);
			window.timerHandle = null;
		}

		window.timerHandle = setTimeout(() => popup.style.display = "none", window.zoomTimeout);
	}

	// Zoom levels are saved as component state "fsbl-zoom"
	FSBL.Clients.WindowClient.setComponentState({ field: "fsbl-zoom", value: window.fsblZoomLevel });
}

function zoomIn() {
	window.fsblZoomLevel += window.zoomStep;
	setZoom(window.fsblZoomLevel);
}

function zoomOut() {
	window.fsblZoomLevel -= window.zoomStep;
	setZoom(window.fsblZoomLevel);
}

function resetZoom() {
	window.fsblZoomLevel = 1;
	setZoom(window.fsblZoomLevel);
}

function insertPopUp() {
	let popup = document.querySelector("#zoom-popup");
	if (!popup) {
		// Create popup div, with ID anc class and text
		popup = document.createElement("div");
		popup.id = "zoom-popup";
		popup.className = "popup";
		popup.appendChild(document.createTextNode("Zoom: "));

		// Create Div to contain the zoom level text
		const span = document.createElement("span");
		span.id = "zoom-popup-text";
		popup.appendChild(span);

		// Add line break between zoom level and buttons
		const br = document.createElement("br");
		popup.appendChild(br);

		// Create zoom out button
		const zoomOutBtn = document.createElement("button");
		zoomOutBtn.appendChild(document.createTextNode("-"));
		zoomOutBtn.onclick = zoomOut;
		popup.appendChild(zoomOutBtn);

		// Create reset button
		const resetBtn = document.createElement("button");
		resetBtn.appendChild(document.createTextNode("Reset"));
		resetBtn.onclick = resetZoom;
		popup.appendChild(resetBtn);

		// Create zoom in button
		const zoomInBtn = document.createElement("button");
		zoomInBtn.appendChild(document.createTextNode("+"));
		zoomInBtn.onclick = zoomIn;
		popup.appendChild(zoomInBtn);

		document.body.appendChild(popup);
	}
}

function zoomConfigHandler(err, zoom) {
	if (err) {
		return FSBL.Clients.Logger.error(err);
	}

	if (!zoom) {
		// No config, use defaults.
		return;
	}

	window.zoomTimeout = zoom.timeout ? zoom.timeout : 1000;
	window.zoomStep = zoom.step ? zoom.step : 0.1;
	window.zoomMin = zoom.min ? zoom.min : 0.2;
	window.zoomMax = zoom.max ? zoom.max : 5;
}

// Startup, attaches ctrl+ and ctrl- as hot keys
// Checks for an existing zoom state and initializes the screen to that zoom level if set
function runZoomHandler() {
	insertPopUp();

	FSBL.Clients.ConfigClient.getValue(
		{
			field: "finsemble.Window Manager.zoom"
		}, zoomConfigHandler);

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
if (FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", runZoomHandler);
} else {
	window.addEventListener("FSBLReady", runZoomHandler);
}
