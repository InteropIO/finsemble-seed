window.launchTutorial = function launchTutorial() {
	fin.desktop.System.openUrlWithBrowser("https://www.chartiq.com/tutorials/?slug=finsemble-seed-project", function () {
		console.log("successfully launched docs");
	}, function (err) {
		console.log("failed to launch docs");
	});
}

window.quitFinsemble = function quitFinsemble() {
	console.log("Quit button successfully triggered");
	FSBL.shutdownApplication();
}

FSBL.addEventListener('onReady', function () {
	FSBL.Clients.WindowClient.setWindowTitle(fin.desktop.Window.getCurrent().name);
	MyBounds = {};
	function cleanupBoundsText() {
		MyBounds.bottom = MyBounds.top + MyBounds.height;
		MyBounds.right = MyBounds.left + MyBounds.width;
		return 'Top: ' + MyBounds.top + "<br>" +
			"Left: " + MyBounds.left + "<br>" +
			"Height: " + MyBounds.height + "<br>" +
			"Width: " + MyBounds.width + "<br>" +
			"Bottom: " + MyBounds.bottom + "<br>" +
			"Right: " + MyBounds.right + "<br>" +
			"MovableGroup: " + (typeof MyBounds.groupData !== "undefined" ? MyBounds.groupData.isInMovableGroup : false) + "<br>" +
			"Rectangle: "  + (typeof MyBounds.groupData !== "undefined" ?  MyBounds.groupData.isARectangle : false) + "<br>";
	}
	function reRenderBounds(bounds = MyBounds) {
		MyBounds = bounds;
		document.getElementById('bounds').innerHTML = cleanupBoundsText();

	}
	fin.desktop.Window.getCurrent().getBounds(reRenderBounds);

	FSBL.Clients.WindowClient.finsembleWindow.addListener("bounds-set", reRenderBounds);
	var getMyDockingGroups = (groupData) => {
		let myGroups = [];
		let windowName = FSBL.Clients.WindowClient.windowName;
		if (groupData) {
			for (var groupName in groupData) {
				groupData[groupName].groupName = groupName;
				if (groupData[groupName].windowNames.includes(windowName)) {
					myGroups.push(groupData[groupName]);
				}
			}
		}
		return myGroups;
	}
	var onDockingGroupUpdate = (err, response) => {
		let groupNames = Object.keys(response.data.groupData);
		let movableGroups = groupNames
			.filter(groupName => response.data.groupData[groupName].isMovable)
			.map(groupName => response.data.groupData[groupName]);
		/**
		 * Goes through groups and sees if this window is grouped, snapped, or freely hanging out there.
		 */
		let isSnapped = false;
		let isInMovableGroup = false;
		let isTopRight = false;
		let isARectangle = false;
		let myGroups = getMyDockingGroups(response.data.groupData);
		for (let i = 0; i < myGroups.length; i++) {
			let myGroup = myGroups[i];
			if (myGroup.isMovable) {
				isInMovableGroup = true;
				isARectangle = myGroup.isARectangle;
				if (FSBL.Clients.WindowClient.windowName == myGroup.topRightWindow) {
					isTopRight = true;
				}
			} else {
				isSnapped = true;
			}
		}
		MyBounds.groupData = {
			isInMovableGroup, isARectangle
		}

		reRenderBounds();
	}
	FSBL.Clients.RouterClient.subscribe("Finsemble.WorkspaceService.groupUpdate", onDockingGroupUpdate);

});