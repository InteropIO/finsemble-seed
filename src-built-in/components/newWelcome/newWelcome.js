window.launchDocs = function launchDocs() {
	fin.desktop.System.openUrlWithBrowser("https://documentation.chartiq.com/finsemble/tutorial-ConfigReference.html", function () {
		//console.log("successfully launched docs");
	}, function (err) {
		//console.log("failed to launch docs");
	});
}

window.launchTutorial = function launchTutorial() {
	fin.desktop.System.openUrlWithBrowser("https://www.chartiq.com/tutorials/?slug=finsemble", function () {
		//console.log("successfully launched docs");
	}, function (err) {
		//console.log("failed to launch docs");
	});
}

window.tourSnapandDock = function tourSnapandDock() {
	FSBL.Clients.LauncherClient.spawn("Tour Snap and Dock",
		{
			addToWorkspace: true,
			position: "relative",
			left: 450,
			top: 0
		},
		function () {
		});
}

window.tourHotkeys = function tourHotkeys() {
	FSBL.Clients.LauncherClient.spawn("Tour Hotkeys",
		{
			addToWorkspace: true,
			position: "relative",
			right: 870,
			top: 0
		},
		function () {
		});
}

window.tourWorkspaces = function tourWorkspaces() {
	FSBL.Clients.LauncherClient.spawn("Tour Workspaces",
		{
			addToWorkspace: true,
			position: "relative",
			left: 0,
			bottom: 650
		},
		function () {
		});
}

window.quitFinsemble = function quitFinsemble() {
	//console.log("Quit button successfully triggered");
	FSBL.shutdownApplication();
}

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener('onReady', init);
} else {
	window.addEventListener('FSBLReady', init);
}

function init() {

}