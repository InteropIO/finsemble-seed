window.quitFinsemble = function quitFinsemble() {
	//console.log("Quit button successfully triggered");
	FSBL.shutdownApplication();
};

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", init);
} else {
	window.addEventListener("FSBLReady", init);
}

function init() {
	window.launchTutorial = function launchTutorial() {
		FSBL.System.openUrlWithBrowser(
			"https://www.chartiq.com/tutorials/?slug=finsemble",
			() => {
				//console.log("successfully launched docs");
			},
			(err) => {
				//console.log("failed to launch docs");
			}
		);
	};
}
