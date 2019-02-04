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

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener('onReady', init);
} else {
	window.addEventListener('FSBLReady', init);
}

function init() {

}
window.run = () => FSBL.Clients.LauncherClient.spawn("CustomNotification",
{
		data: { "notificationMessage": "You are not authenticated.  No access to C1 Desktop." },
		left: "center",
		top: "center",
}, function (err, msg) {
		console.log("Report showWindow error", msg);
});
