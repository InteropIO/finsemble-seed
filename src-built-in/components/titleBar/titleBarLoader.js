/**
 * This file is part of the titlebar delivery
 * mechanism and should not be customized.
 */

function init() {
	if (window.headerLoaded) return;
	window.headerLoaded = true;
	require("./TitleBar.jsx");
}

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", init);
} else {
	window.addEventListener("FSBLReady", init);
}
