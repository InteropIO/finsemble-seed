/**
 * This file is part of the titlebar delivery
 * mechanism and should not be customized.
 */

function init() {
	if (window.headerLoaded) return;
	window.headerLoaded = true;
	require("./WindowTitleBar.jsx");
}

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", init);
} else {
	window.addEventListener("FSBLReady", init);
}
