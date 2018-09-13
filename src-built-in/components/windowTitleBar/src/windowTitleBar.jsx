// React events were getting attached to shadow dom elements if react was included before hand. so for using react in preload, just require the files after we are ready.
function init() {
    console.log("load this")
    require("./windowTitleBar2.jsx")
}

if (FSBL) {
	FSBL.addEventListener("onReady", init)
} else {
	window.addEventListener("FSBLReady", init)
}

