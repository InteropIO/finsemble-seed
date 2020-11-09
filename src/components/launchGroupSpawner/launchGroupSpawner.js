import spawnComponentGroup from './spawnComponentGroup'

const FSBLReady = () => {
	try {
		//get the spawner configuration provided in spawn data.
		let spawnerData = FSBL.Clients.WindowClient.getSpawnData();
		if (spawnerData && spawnerData.toSpawn) {
			//get the spawner's own config and position info (the spawned components will offset from that position)
			finsembleWindow.getOptions(async (err,data) => {
				if(!err) {
					let spawnerOptions = data;
					//let spawnerConfig = FSBL.Clients.WindowClient.options.customData;

                    spawnerOptions.bottom = spawnerOptions.defaultTop + spawnerOptions.defaultHeight;
                    spawnerOptions.right = spawnerOptions.defaultLeft + spawnerOptions.defaultWidth;
                    if (!spawnerOptions.monitorDimensions) {
                        const monitor = await FSBL.Clients.LauncherClient.getMonitor(finsembleWindow.windowIdentifier);
                        spawnerOptions.monitorDimensions = monitor.availableRect;
                    }
					let params = {
						//make position data relative to the current monitor (and convert bottom/right to distance from those edges)
						top: spawnerOptions.defaultTop, // - spawnerOptions.monitorDimensions.top, /* disabled due to changes in Finsemble claimed space) */ 
						left: spawnerOptions.defaultLeft, // - spawnerOptions.monitorDimensions.left, /* disabled due to changes in Finsemble claimed space) */
						bottom: spawnerOptions.monitorDimensions.bottom - spawnerOptions.bottom,
						right: spawnerOptions.monitorDimensions.right - spawnerOptions.right,
						width: spawnerOptions.defaultWidth,
						height: spawnerOptions.defaultHeight,
						linkerGroup: spawnerData.linkerGroup,
						addToWorkspace: spawnerData.addToWorkspace
                    }

					spawnComponentGroup(spawnerData.toSpawn, params)
						.then((spawnResponses) => { 
							FSBL.Clients.Logger.log("Group components spawn responses:", spawnResponses);
							//Close the spawner component as its no longer needed
							FSBL.Clients.WindowClient.close({ removeFromWorkspace: true, closeWindow: true });
						})
						.catch((err) => { 
							FSBL.Clients.Logger.error("Failed to spawn component group, error:", err);
						});
				} else {
					FSBL.Logger.error("Failed to retrieve spawner's dimensions! Error: ", err);
				}
			});
		} else {
			FSBL.Logger.error("Received no spawner data, spawnerData: ", spawnerData);
		}
	} catch (e) {
		FSBL.Clients.Logger.error(e);
	}
}

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", FSBLReady)
} else {
	window.addEventListener("FSBLReady", FSBLReady)
} 