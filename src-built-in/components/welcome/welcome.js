window.launchTutorial = function launchTutorial() {
	fin.desktop.System.openUrlWithBrowser("https://www.chartiq.com/tutorials/?slug=finsemble-seed-project", function () {
	//console.log("successfully launched docs");
	}, function (err) {
	//console.log("failed to launch docs");
	});
}

window.quitFinsemble = function quitFinsemble() {
//console.log("Quit button successfully triggered");
	FSBL.shutdownApplication();
}

FSBL.addEventListener('onReady', function () {
});