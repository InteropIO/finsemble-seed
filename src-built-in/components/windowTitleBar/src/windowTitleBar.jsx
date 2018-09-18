// React events were getting attached to shadow dom elements if react was included before hand. so for using react in preload, just require the files after we are ready.
function init() {
	// preventing loading multiple times because preload happens more than once??
	if (window.headerLoaded) return;
	window.headerLoaded = true;
    console.log("load this")
    require("./windowTitleBar2.jsx")
}

if (window.FSBL && FSBL.addEventListener) {
	console.log("fsbl event")
	FSBL.addEventListener("onReady", init)
} else {
	console.log("window event")
	window.addEventListener("FSBLReady", init)
}

