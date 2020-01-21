import spawnComponentGroup from './spawnComponentGroup'

const FSBLReady = () => {
	try {
		//get the spawner configuration provided in spawn data.
		let spawnerData = FSBL.Clients.WindowClient.getSpawnData();
		if (spawnerData && spawnerData.toSpawn) {
			//get the spawner's own config and position info (the spawned components will offset from that position)
			let spawnerConfig = FSBL.Clients.WindowClient.options.customData;
			let groupTop = spawnerConfig.window.top;
			let groupLeft = spawnerConfig.window.left;
			let linkerGroup = spawnerConfig.window.data.linkerGroup;

			spawnComponentGroup(spawnerData.toSpawn, groupTop, groupLeft, linkerGroup);
		} else {
			FSBL.Logger.error("Received no spawner data, spawnerData: ", spawnerData);
		}
		//FSBL.Clients.WindowClient.close({ removeFromWorkspace: true, closeWindow: true });

	} catch (e) {
		FSBL.Clients.Logger.error(e);
	}
}

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", FSBLReady)
} else {
	window.addEventListener("FSBLReady", FSBLReady)
}