import { isArray } from "util";

const FSBLReady = () => {
	try {
		let spawnerData = FSBL.Clients.WindowClient.getSpawnData();
		if (spawnerData && spawnerData.toSpawn) {
			//spawn the first component and then recurse relatives
			doSpawn(spawnerData.toSpawn)
			.then(function(firstWindowIdentifier) {
				if (spawnerData.toSpawn.formGroup) {
					//tell the primary component to form a group if requested to
					FSBL.Clients.Logger.log("forming group on:", firstWindowIdentifier);
					FSBL.Clients.RouterClient.transmit("DockingService.formGroup", { windowName: firstWindowIdentifier.windowName });
				} else {
					FSBL.Clients.Logger.log("formGroup not requested");
				}

				//close the spawner now we're done
				FSBL.Clients.Logger.log("Done spawning, time to close");
				
				//disabled as its making it hard to debug by dropping logs from central logger
				//FSBL.Clients.WindowClient.close();
			});
		} else {
			FSBL.Logger.error("Received no spawner data, spawnerData: ", spawnerData);
			FSBL.Clients.WindowClient.close();
		}

	} catch (e) {
		FSBL.Clients.Logger.error(e);
	}
}

const spawnRelatives = function(parentWindowIdentifier, relativeData) {
	if (relativeData && Array.isArray(relativeData) && relativeData.length > 0) {
		FSBL.Clients.Logger.log("Spawning relatives of: ", parentWindowIdentifier);
		return (Promise.all(relativeData.map(function (elem) {
			return doSpawn(elem,parentWindowIdentifier);
		})).then(Promise.resolve(parentWindowIdentifier))); //pass the parentWindowIdentifier back up when done
	} else {
		FSBL.Clients.Logger.log("No relatives to spawn for: ", parentWindowIdentifier);
		return Promise.resolve(parentWindowIdentifier);//pass the parentWindowIdentifier back up when done
	}
}

const doSpawn = function(toSpawn, parentWindowIdentifier) {
	if (!toSpawn.spawnOptions) { toSpawn.spawnOptions = {}; }
	if (parentWindowIdentifier) {
		toSpawn.spawnOptions.relativeWindow = parentWindowIdentifier;
		toSpawn.spawnOptions.position = "relative";
	}
	//make sure spawned components are added to workspace
	toSpawn.spawnOptions.addToWorkspace = true;
	FSBL.Clients.Logger.log(`Spawning ${toSpawn.componentType} with options: ${JSON.stringify(toSpawn.spawnOptions, null, 2)}`);

	return FSBL.Clients.LauncherClient.spawn(
		toSpawn.componentType, 
		toSpawn.spawnOptions)
	.then(function(data) {
		//collect its window identifier for later
		FSBL.Clients.Logger.log("Response from spawn: ", data.response);
		//recursively spawn all relative components
		return spawnRelatives(data.response.windowIdentifier, toSpawn.relatives);
	});
}

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", FSBLReady)
} else {
	window.addEventListener("FSBLReady", FSBLReady)
}