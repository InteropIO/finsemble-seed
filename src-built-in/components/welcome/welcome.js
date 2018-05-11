window.launchTutorial = function launchTutorial() {
	fin.desktop.System.openUrlWithBrowser("https://www.chartiq.com/tutorials/?slug=finsemble-seed-project", function () {
		console.log("successfully launched docs");
	},function (err) {
		console.log("failed to launch docs");
	});
}

window.quitFinsemble = function quitFinsemble() {
	console.log("Quit button successfully triggered");
	FSBL.shutdownApplication();
}

FSBL.addEventListener('onReady', function () {
	FSBL.Clients.WindowClient.setWindowTitle(fin.desktop.Window.getCurrent().name);

	function cleanupBoundsText(bounds) {
		bounds.bottom = bounds.top + bounds.height;
		bounds.right = bounds.left + bounds.width;
		return 'Top: ' + bounds.top + "<br>" +
			"Left: " + bounds.left + "<br>" +
			"Height: " + bounds.height + "<br>" +
			"Width: " + bounds.width + "<br>" +
			"Bottom: " + bounds.bottom + "<br>" +
			"Right: " + bounds.right + "<br>";
	}

	fin.desktop.Window.getCurrent().getBounds(function (bounds) {
		document.getElementById('bounds').innerHTML = cleanupBoundsText(bounds);
	});

	fin.desktop.Window.getCurrent().addEventListener('disabled-frame-bounds-changing', function (bounds) {
		document.getElementById('bounds').innerHTML = cleanupBoundsText(bounds);
	});
	fin.desktop.Window.getCurrent().addEventListener('disabled-frame-bounds-changed', function (bounds) {
		document.getElementById('bounds').innerHTML = cleanupBoundsText(bounds);
	});
	fin.desktop.Window.getCurrent().addEventListener('bounds-changing', function (bounds) {
		document.getElementById('bounds').innerHTML = cleanupBoundsText(bounds);
	});
	fin.desktop.Window.getCurrent().addEventListener('bounds-changed', function (bounds) {
		document.getElementById('bounds').innerHTML = cleanupBoundsText(bounds);
	});
});