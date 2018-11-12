function init() {
	if (window.headerLoaded) return;
	window.headerLoaded = true;
	require("./windowTitleBar2.jsx");
}

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", init);
} else {
	window.addEventListener("FSBLReady", init);
}