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
	window.launchTutorial = function launchTutorial() {
		FSBL.System.openUrlWithBrowser("https://www.chartiq.com/tutorials/?slug=finsemble", function () {
			//console.log("successfully launched docs");
		}, function (err) {
			//console.log("failed to launch docs");
		});
	}
}

window.resizeWindowInGroup = async function(height) {
	// Determine if this window is in a group
	const windowGroups = FSBL.Clients.WindowClient.getWindowGroups();
	let boundsResponse = await finsembleWindow.getBounds();
	if (!(boundsResponse && boundsResponse.data)) {
		console.error(`Error fetching bounds ${boundsResponse.err}`);
		return;
	}
	finsembleWindow.bounds = boundsResponse.data;
	const deltaHeight = height - finsembleWindow.bounds.height;
	if(windowGroups.length > 0){
		// Fetch all wraps of windows in this group
		for(const windowName of windowGroups[0].windowNames) {
			const windowWrap = await FSBL.FinsembleWindow.getInstance({name:windowName})
			if(!(windowWrap && windowWrap.wrap)) {
				console.error(`Error fetching wrap ${windowName}`);
				continue;
			}
			boundsResponse = await windowWrap.wrap.getBounds();
			if (!(boundsResponse && boundsResponse.data)) {
				console.error(`Error fetching bounds ${boundsResponse.err}`);
				return;
			}
			windowWrap.wrap.bounds = boundsResponse.data;
			// Move any window adjacent to bottom edge
			if(windowWrap.wrap.bounds.top == finsembleWindow.bounds.bottom) {
				windowWrap.wrap.bounds.top += deltaHeight;
				windowWrap.wrap.setBounds(windowWrap.wrap.bounds);
				FSBL.Clients.RouterClient.transmit("DockingService.updateWindowLocation", 
					{ windowName: windowWrap.wrap.name, location: windowWrap.wrap.bounds });
			}
		}
	}
	// Finally, adjust this window's height
	finsembleWindow.setBounds({height:height});
	boundsResponse = await finsembleWindow.getBounds();
	if (!(boundsResponse && boundsResponse.data)) {
		console.error(`Error fetching bounds ${boundsResponse.err}`);
		return;
	}
	FSBL.Clients.RouterClient.transmit("DockingService.updateWindowLocation", 
		{ windowName: finsembleWindow.name, location: boundsResponse.data });
}