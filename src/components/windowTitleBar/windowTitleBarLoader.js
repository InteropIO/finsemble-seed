/**
 * This file is part of the titlebar delivery
 * mechanism and should not be customized.
 */

function init() {
	// Temporary hack for browserview parent and contents both triggering FSBL ready. This can cause titlebar listeners to not get setup
	// Will be removed with the work for only parent windows to send the spawn complete callback.
	setTimeout(() => require("./WindowTitleBar.jsx"), 100);
}

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", init);
} else {
	window.addEventListener("FSBLReady", init);
}
