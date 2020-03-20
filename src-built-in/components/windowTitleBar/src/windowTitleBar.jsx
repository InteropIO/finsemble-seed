function init() {
	if (window.headerLoaded) return;
	window.headerLoaded = true;
	// Sidd's fix for the react problem when pre-loading the component
	require("./windowTitleBarComponent.jsx");
}
if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", init);
} else {
	window.addEventListener("FSBLReady", init);
}
