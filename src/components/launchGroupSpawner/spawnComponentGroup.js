/**
 * Spawn multiple components, via an array of Objects defining the componentType and spawnOptions 
 * to pass to LauncherClient.spawn. The spawned components are grouped automatically.
 * 
 * @param {Array} componentsToSpawn An array of objects with componentType and spawnOptions values. 
 * Most arguments that are normally passed to spawn are supported, although positioning must be specified
 * using top and left, which will be interpreted as an offset from the groupTop and groupLeft coordinates provided.
 * @param {number} groupTop The top coordinate of the group from which each component's top is offset
 * @param {number} groupLeft  The left coordinate of the group from which each component's left is offset.
 * @param {string} linkerGroup (Optional) The name of the linker group to add the spawned components to or 'auto' to automatically select an empty (or the least populated) linker group.
 * @returns {Array} An array of the responses from each spawn command [{err, response},...]
 * @example 
 * let toSpawn = [{
 * 			"componentType": "Welcome Component",
 * 			"spawnOptions": {"top": 0, "left": 0, "height": 400, "width": 300, "data": {}}
 * 		},
 * 		{
 * 			"componentType": "Welcome Component",
 * 			"spawnOptions": {"top": 0, "left": 300, "height": 400, "width": 500, "data": {}}
 * 		},
 * 		{
 * 			"componentType": "Welcome Component",
 * 			"spawnOptions": {"top": 400, "left": 0, "height": 400, "width": 800, "data": {})
 * 			}
 * 		}];
 * let promise = spawnComponentGroup(toSpawn, 200, 200, 'auto');
 */
const spawnComponentGroup = function(componentsToSpawn, groupTop, groupLeft, linkerGroup) {
	if (linkerGroup == 'auto'){
		linkerGroup = pickLeastUsedLinkerGroup();
	}
	let compsToSpawn = processConfig(componentsToSpawn, groupTop, groupLeft);
	FSBL.Clients.Logger.log(`Spawning component group at top: ${groupTop}, left: ${groupLeft}, linkerGroup: ${linkerGroup} and config:`, componentsToSpawn);
	return Promise.all(compsToSpawn.map(function(aComp) {
		if (linkerGroup) { 
			if (!aComp.spawnOptions.data) { aComp.spawnOptions.data = {}; }
			aComp.spawnOptions.data.linker = { channels: [linkerGroup]};
		}
		FSBL.Clients.Logger.log(`Spawning ${aComp.componentType} with options: ${JSON.stringify(aComp.spawnOptions, null, 2)}`);
		return FSBL.Clients.LauncherClient.spawn(aComp.componentType, aComp.spawnOptions);
	})).then(function(spawnResponses){
		FSBL.Clients.Logger.log("Spawn responses:", spawnResponses);
		//tell the first component to form a group 
		FSBL.Clients.Logger.log("forming group on:", spawnResponses[0].response.windowIdentifier);
		FSBL.Clients.RouterClient.transmit("DockingService.formGroup", { windowName: spawnResponses[0].response.windowIdentifier.windowName });
		return spawnResponses;
	});
}

/**
 * Process the arguments provide for each component and offset their position from the groupTop and groupLeft.
 * @param {Array} componentsToSpawn An array of objects defining the componentType and spawnOptions to pass to LauncherClient.spawn for each component
 * @param {number} groupTop The top coordinate of the group from which each component's top is offset
 * @param {number} groupLeft  The left coordinate of the group from which each component's left is offset
 * @returns {Array} The array of processed config objects [{componentType: "Comp Type", spawnOptions: {...}},...]
 */
const processConfig = function(componentsToSpawn, groupTop, groupLeft) {
	//process the array of components to set position arguments
	return componentsToSpawn.map(function (comp){ 
		if (!comp.spawnOptions) { comp.spawnOptions = {}; }
		comp.spawnOptions.top = groupTop + comp.spawnOptions.top;
		comp.spawnOptions.left = groupLeft + comp.spawnOptions.left;
		//ensure the spawned components are added to the workspace
		comp.spawnOptions.addToWorkspace = true;
		return comp;
	});
}

/**
 * Find the least populated linker group and return its name.
 * @returns {string} The name of the first, least populated Linker group.
 */
const pickLeastUsedLinkerGroup = function(){
    let groups = FSBL.Clients.LinkerClient.getAllGroups();
    let components = FSBL.Clients.LinkerClient.getLinkedWindows({});
    let used = {};
    components.forEach(comp => {
        comp.channels.forEach(channel => {
            if (used[channel]){ used[channel]++; }
            else { used[channel] = 1; }
        });
    });
    console.log("Linker group membership: ", used);
    let leastGroup = groups[0].name;
    let least = (used[groups[0].name] ? used[groups[0].name] : 0);
    for (let g=0; g<groups.length; g++) { 
        let groupName = groups[g].name;
        if (!used[groupName]) { 
            leastGroup = groupName; 
            break; 
        } else if (used[groupName] < least) {
            leastGroup = groupName; 
            least = used[groupName];
        }
    }
    return leastGroup;
};

export { spawnComponentGroup as default };