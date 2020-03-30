import spawnComponentGroup from './spawnComponentGroup'

const FSBLReady = () => {
	try {
		//get the spawner configuration provided in spawn data.
		let spawnerData = FSBL.Clients.WindowClient.getSpawnData();
		if (spawnerData && spawnerData.toSpawn) {
			//get the spawner's own config and position info (the spawned components will offset from that position)
			finsembleWindow.getOptions((err,data) => {
				if(!err) {
					let spawnerOptions = data;
					//let spawnerConfig = FSBL.Clients.WindowClient.options.customData;
			
					let params = {
						top: spawnerOptions.top,
						left: spawnerOptions.left,
						width: spawnerOptions.width,
						height: spawnerOptions.height,
						//linkerGroup: spawnerConfig.window.data.linkerGroup,
						linkerGroup: spawnerData.linkerGroup,
						addToWorkspace: spawnerData.addToWorkspace
					}
	
					spawnComponentGroup(spawnerData.toSpawn, params);
				} else {
					FSBL.Logger.error("Failed to retrieve spawner's dimensions! Error: ", err);
				}
			});
		} else {
			FSBL.Logger.error("Received no spawner data, spawnerData: ", spawnerData);
		}
		FSBL.Clients.WindowClient.close({ removeFromWorkspace: true, closeWindow: true });

	} catch (e) {
		FSBL.Clients.Logger.error(e);
	}
}

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", FSBLReady)
} else {
	window.addEventListener("FSBLReady", FSBLReady)
}