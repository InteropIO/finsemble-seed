var componentToTrackName = "Notepad"
var componentToTrack

const FSBLReady = () => {
	try {
		FSBL.Clients.WindowClient.getBounds((err, bound) => {
			setTrackingComponentPosition(bound)
		})
		showComponentToTrack()
	} catch (e) {
		FSBL.Clients.Logger.error(e);
	}
}

const showComponentToTrack = () => {
	// use tracking Component's state
	FSBL.Clients.WindowClient.getComponentState({
		field: 'bound',
	}, (err, state) => {
		if (state) {
			setTrackingComponentPosition(state)
		} else {
			FSBL.Clients.WindowClient.getBounds((err, bound) => {
				setTrackingComponentPosition(bound)
			})
		}
	});
}

const setTrackingComponentPosition = (position) => {
	FSBL.Clients.LauncherClient.showWindow({
		name: componentToTrackName,
		componentType: componentToTrackName
	}, {
		top: position.top,
		left: position.left,
		width: position.width,
		height: position.height,
		autoFocus: true,
		spawnIfNotFound: true
	}, (err, windowIdentifier) => {
		componentToTrack = windowIdentifier.finWindow
		// Listen to bounds-change-end of componentToTrack
		componentToTrack.addEventListener("bounds-change-end", (event) => {
			console.log(event)
			bounds = event.data;
			delete bounds.right;
			delete bounds.bottom
			//Save bound to trackingComponent's state
			FSBL.Clients.WindowClient.setComponentState({
				field: 'bound',
				value: bounds
			});
		});
	})
}

const onunload = () => {
	componentToTrack.minimize()
}

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", FSBLReady)
} else {
	window.addEventListener("FSBLReady", FSBLReady)
}
window.addEventListener("unload", onunload)