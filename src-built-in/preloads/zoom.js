// This global will contain our current zoom level
window.fsblZoomLevel = 1;

// Global variable with the timeout for the zoom
window.zoomTimeout = 1000;
window.zoomStep = 0.1;
window.zoomMin = 0.2;
window.zoomMax = 5;

/**
 * Sets the zoom by setting the CSS "zoom" value on the body.
 *
 * It sets an opposing zoom on the Finsemble header in order that it maintains its size
 * @param {Number} pct The zoom level (1 is 100%)
 */
const setZoom = (pct) => {
	// enforce min/max zoom
	if (pct < window.zoomMin) {
		pct = window.zoomMin;
	} else if (pct > window.zoomMax) {
		pct = window.zoomMax;
	}

	document.querySelectorAll("body > *").forEach((el) => el.style.zoom = pct);

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

/**
 * Zooms the page in one step.
 */
const zoomIn = () => {
	window.fsblZoomLevel += window.zoomStep;
	setZoom(window.fsblZoomLevel);
}

/**
 * Zooms the page out one step.
 */
const zoomOut = () => {
	window.fsblZoomLevel -= window.zoomStep;
	setZoom(window.fsblZoomLevel);
}

/**
 * Resets the zoom level to 100%.
 */
const resetZoom = () => {
	window.fsblZoomLevel = 1;
	setZoom(window.fsblZoomLevel);
}

/**
 * Inserts the pop up element into the page if needed.
 */
const insertPopUp = () => {
	let popup = document.querySelector("#zoom-popup");
	if (popup) {
		// Pop up already created.
		return;
	}

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

/**
 * Handles the zoom configuration.
 * @param {*} err The error getting zoom config, if one occurred.
 * @param {object} zoom The zoom configuration object
 * @param {Number} zoom.timeout The number of milliseconds the zoom pop up should be displayed before it is hidden (Default 1000).
 * @param {Number} zoom.step How much the zoom should increase or decrease when zooming in or out (Default 0.1).
 * @param {Number} zoom.max The maximum allowed zoom level (Default 5).
 * @param {Number} zoom.min The minimum allowed zoom level (Default 0.2).
 */
const zoomConfigHandler = (err, zoom) => {
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

/**
 * Applies the zoom level from the component state.
 *
 * @param {*} err The error, if one occurred, from getting the zoom level from component state.
 * @param {Number} zoomLevel The zoom level saved in the component.
 */
const getZoomLevelHandler = (err, zoomLevel) => {
	if (err) {
		FSBL.Clients.Logger.info("No \"fsbl-zoom\" settings found in component state", err);
	}

	if (zoomLevel != null) {
		window.fsblZoomLevel = zoomLevel;
		setZoom(window.fsblZoomLevel);
	}
};

/**
 * Initializes the zoom handler.
 */
const runZoomHandler = () => {
	// Insert the zoom pop up, if needed.
	insertPopUp();

	// Update the zoom configuration.
	FSBL.Clients.ConfigClient.getValue({ field: "finsemble.Window Manager.zoom" }, zoomConfigHandler);

	// Create hot keys for zooming.
	FSBL.Clients.HotkeyClient.addBrowserHotkey(["ctrl", "="], zoomIn);
	//TODO: enable when finsemble supports mapping + key
	//FSBL.Clients.HotkeyClient.addBrowserHotkey(["ctrl", "+"], zoomIn);
	FSBL.Clients.HotkeyClient.addBrowserHotkey(["ctrl", "-"], zoomOut);
	FSBL.Clients.HotkeyClient.addBrowserHotkey(["ctrl", "0"], resetZoom);

	// Updates the component with the zoom level from the previous load, if one exists.
	FSBL.Clients.WindowClient.getComponentState({ field: "fsbl-zoom" }, getZoomLevelHandler);
};

// TODO, catch and recall scroll position

// Startup pattern for preload. Preloads can come in any order, so we need to wait on either the window event or the
// FSBL event
if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", runZoomHandler);
} else {
	window.addEventListener("FSBLReady", runZoomHandler);
}
