function launchTutorial() {
	fin.desktop.System.openUrlWithBrowser("https://documentation.chartiq.com/finsemble/tutorial-gettingStarted.html", function () {
		console.log("successfully launched docs");
	},function (err) {
		console.log("failed to launch docs");
	});
}

FSBL.addEventListener('onReady', function () {
	FSBL.Clients.WindowClient.setWindowTitle("Sales Ticket");
});