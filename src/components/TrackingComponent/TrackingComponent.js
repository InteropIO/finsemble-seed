var componentToTrackName = "Notepad"
var componentToTrack

const FSBLReady = async () => {
	try {
		FSBL.Clients.WindowClient.getBounds(async (err, bound) => {
			await restoreComponentToTrack(bound)
			moveComponentToTrack()
		})
	} catch (e) {
		FSBL.Clients.Logger.error(e);
	}
}

const restoreComponentToTrack = async (bound) => {
	await FSBL.Clients.LauncherClient.showWindow({
		name: componentToTrackName,
		componentType: componentToTrackName
	}, {
		top: bound.top,
		left: bound.left,
		width: bound.width,
		height: bound.height,
		autoFocus: true,
		spawnIfNotFound: true
	}, async (err, windowIdentifier) => {
		componentToTrack = windowIdentifier.finWindow
		componentToTrack.restore(() => {
			componentToTrack.focus()
		})
	})
}

const moveComponentToTrack = () => {
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

const setTrackingComponentPosition = async (position) => {
	componentToTrack.setBounds(position, () => {
		componentToTrack.maximize(() => {
			componentToTrack.restore(() => {
				//FinsembleWindow to listen bounds-change-end
				componentToTrack.addEventListener("bounds-change-end", (event) => {
					bounds = event.data;
					bounds.monitor = componentToTrack.monitor
					delete bounds.right;
					delete bounds.bottom
					//Save bound to trackingComponent's state
					FSBL.Clients.WindowClient.setComponentState({
						field: 'bound',
						value: bounds
					});
				});
			})
		})
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