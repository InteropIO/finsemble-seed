/**
 * Spawn multiple components, via an array of Objects defining the componentType and spawnOptions 
 * to pass to LauncherClient.spawn. The spawned components are grouped automatically.
 * 
 * @param {Array} componentsToSpawn An array of objects with componentType and spawnOptions values. 
 * Most arguments that are normally passed to spawn are supported, although positioning will be 
 * interpreted as relative to the group's coordinates and dimensions.
 * @param {Object} groupParams Parameters defining the group size, position and linker channel on the current monitor (rather than relative to the virtual monitor - hence, the top/left corner should always be 0,0)
 * @param {number} groupParams.top The top coordinate of the group from which each component's top is offset
 * @param {number} groupParams.left The left coordinate of the group from which each component's left is offset.
 * @param {number} groupParams.width (Optional) The width of the group, required if the size or position of components in the group are expressed as a percentage of the group size. 
 * @param {number} groupParams.height (Optional) The height of the group, required if the size or position of components in the group are expressed as a percentage of the group size.
 * @param {boolean} groupParams.addToWorkspace (Default: true) Add the spawned components to the workspace
 * @param {string} groupParams.linkerGroup (Optional) The name of the linker group to add the spawned components to or 'auto' to automatically select an empty (or the least populated) linker group.
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
 * let promise = spawnComponentGroup(toSpawn, {top: 200, left: 200, linkerGroup:'auto'});
 * 
 * @example
 * let toSpawn = [{
 * 			"componentType": "Welcome Component",
 * 			"spawnOptions": {"top": 0, "left": 0, "height": "50%", "width": "40%", "data": {}}
 * 		},
 * 		{
 * 			"componentType": "Welcome Component",
 * 			"spawnOptions": {"top": 0, "left": "40%", "height": "50%", "width": "60%", "data": {}}
 * 		},
 * 		{
 * 			"componentType": "Welcome Component",
 * 			"spawnOptions": {"top": "50%", "left": 0, "height": "50%", "width": "100%", "data": {})
 * 			}
 * 		}];
 * let promise = spawnComponentGroup(toSpawn, {top: 200, left: 200, width: "90%", height: "90%", linkerGroup:'auto'});
 */
const spawnComponentGroup = function(componentsToSpawn, groupParams) {
	if (groupParams.linkerGroup == 'auto'){
		groupParams.linkerGroup = pickLeastUsedLinkerGroup();
	}

	let compsToSpawn = processConfig(componentsToSpawn, groupParams);
	FSBL.Clients.Logger.log(`Spawning component group at top: ${groupParams.top}, left: ${groupParams.left}, width: ${groupParams.width}, height: ${groupParams.height}, linkerGroup: ${groupParams.linkerGroup} and config:`, componentsToSpawn);
	return Promise.all(compsToSpawn.map(function(aComp) {
		if (groupParams.linkerGroup) { 
			if (!aComp.spawnOptions.data) { aComp.spawnOptions.data = {}; }
			aComp.spawnOptions.data.linker = { channels: [groupParams.linkerGroup]};
		}
		FSBL.Clients.Logger.log(`Spawning ${aComp.componentType} with options: ${JSON.stringify(aComp.spawnOptions, null, 2)}`);
		return FSBL.Clients.LauncherClient.spawn(aComp.componentType, aComp.spawnOptions);
	})).then(function(spawnResponses){
		//tell the first component to form a group 
		FSBL.Clients.Logger.log("forming group on:", spawnResponses[0].response.windowIdentifier);
		FSBL.Clients.RouterClient.transmit("DockingService.formGroup", { windowName: spawnResponses[0].response.windowIdentifier.windowName });
		return spawnResponses;
	});
}

/**
 * Process the arguments provide for each component and offset their position from the groupTop and groupLeft.
 * @param {Array} componentsToSpawn An array of objects defining the componentType and spawnOptions to pass to LauncherClient.spawn for each component
 * @param {Object} groupParams Parameters defining the group size, position and linker channel. Note that the group's position and size must be specified in pixels and relative to the current monitor (rather than using % based sizing or coordinates in the virtual monitor space). 
 * @param {number} groupParams.top The top coordinate of the group (relative to the current monitor) from which each component's top is offset
 * @param {number} groupParams.left The left coordinate of the group (relative to the current monitor) from which each component's left is offset.
 * @param {number} groupParams.bottom (Optional) The bottom coordinate of the group (relative to the current monitor) from which each component's bottom is offset. Note this is interpreted in the same way as when passed to spawn, i.e. the distance from the bottom (rather than top) edge. Required if any of hte group's components will use 'bottom' in its positioning arguments.
 * @param {number} groupParams.right (Optional) The right coordinate of the group (relative to the current monitor) from which each component's right is offset. Note this is interpreted in the same way as when passed to spawn, i.e. the distance from the right (rather than left) edge. Required if any of hte group's components will use 'right' in its positioning arguments.
 * @param {number} groupParams.width (Optional) The width of the group, required if the size or position of components in the group are expressed as a percentage of the group size.
 * @param {number} groupParams.height (Optional) The height of the group, required if the size or position of components in the group are expressed as a percentage of the group size.
 * @param {boolean} groupParams.addToWorkspace (Default: true) Add the spawned components to the workspace
 * @returns {Array} The array of processed config objects [{componentType: "Comp Type", spawnOptions: {...}},...]
 */
const processConfig = function(componentsToSpawn, groupParams) {
	let failedConfig = false;
	let addToWorkspace = groupParams.addToWorkspace === false ? false : true;

	if ((groupParams.top != undefined && (isNaN(groupParams.top) || groupParams.top < 0)) ||
		(groupParams.left != undefined && (isNaN(groupParams.left) || groupParams.left < 0)) ||
		(groupParams.bottom != undefined && (isNaN(groupParams.bottom) || groupParams.bottom < 0)) ||
		(groupParams.right != undefined && (isNaN(groupParams.right) || groupParams.right < 0)) ||
		(groupParams.width != undefined && (isNaN(groupParams.width) || groupParams.width < 0)) ||
		(groupParams.height != undefined && (isNaN(groupParams.height) || groupParams.height < 0))) {
		throw new Error("Group dimensions and positions must be specified in pixels relative to the current monitor, problem component: \n" + JSON.stringify(groupParams, null, 2));
	}

	//check all components have position and size info
	componentsToSpawn.forEach(element => {
		if ((element.spawnOptions.top == undefined && element.spawnOptions.bottom == undefined) || 
			(!element.spawnOptions.left == undefined && element.spawnOptions.right == undefined) ||
			(!element.spawnOptions.width && (element.spawnOptions.left == undefined || element.spawnOptions.right == undefined)) ||
			(!element.spawnOptions.height && (element.spawnOptions.top == undefined || element.spawnOptions.bottom == undefined))
			){
			throw new Error("Incomplete config for component within group (a position and size must be derivable from the config), groupParams provided: \n" + JSON.stringify(groupParams, null, 2));
		}
	});

	if (!(groupParams.width && groupParams.height)) {
		//check we if we have any % based component sizes/positions
		componentsToSpawn.forEach(element => {
			if (isNaN(element.spawnOptions.top) || isNaN(element.spawnOptions.left) || isNaN(element.spawnOptions.width) || isNaN(element.spawnOptions.height)) {
				throw new Error("Unable to calculate position of component within group as the group width or height was not specified or spawn options for the component were incomplete, groupParams: \n" + JSON.stringify(groupParams, null, 2) + "\nproblem component:\n" + JSON.stringify(element, null, 2));
			}
		});
	}

	if (groupParams.right == undefined) {
		//check we if we have any components positioned using right
		componentsToSpawn.forEach(element => {
			if (element.spawnOptions.right != undefined) {
				throw new Error("Unable to calculate position of component within group as the group right coordinate on the monitor was not specified or spawn options for the component were incomplete, groupParams: \n" + JSON.stringify(groupParams, null, 2) + "\nproblem component:\n" + JSON.stringify(element, null, 2));
			}
		});
	}

	//process the array of components to set position arguments
	return componentsToSpawn.map(function (comp){ 
		//process spawnOptions, convert any % based args into pixel coordinates, offset by group position
		//  N.B. Rounding of coordinates is awkward and must be done correctly to avoid overlaps...
		comp.spawnOptions.top = processCoordinateOrDimension(comp.spawnOptions.top, groupParams.top, groupParams.height, Math.round);
		comp.spawnOptions.left = processCoordinateOrDimension(comp.spawnOptions.left, groupParams.left, groupParams.width, Math.round);

		//interpret bottom and right as spawn does - distance from the bottom and right edges
		comp.spawnOptions.bottom = processCoordinateOrDimension(comp.spawnOptions.bottom, groupParams.bottom, groupParams.height, Math.round);
		comp.spawnOptions.right = processCoordinateOrDimension(comp.spawnOptions.right, groupParams.right, groupParams.width, Math.round);

		comp.spawnOptions.height = processCoordinateOrDimension(comp.spawnOptions.height, 0, groupParams.height, Math.round);
		comp.spawnOptions.width = processCoordinateOrDimension(comp.spawnOptions.width, 0, groupParams.width, Math.round);

		//mitigate oddities with bottom/right positioning
		//TODO replace this - but note it needs the monitor dimensions and right/bottom are specified from the right/bottom edges of the monitor
		// if (comp.spawnOptions.left != undefined && comp.spawnOptions.right != undefined && !comp.spawnOptions.width){
		// 	comp.spawnOptions.width = comp.spawnOptions.right - comp.spawnOptions.left;
		// 	delete comp.spawnOptions.right;
		// } else if (comp.spawnOptions.right != undefined && comp.spawnOptions.width){
		// 	comp.spawnOptions.left = comp.spawnOptions.right - comp.spawnOptions.width;
		// 	delete comp.spawnOptions.right;
		// }

		// if (comp.spawnOptions.top != undefined && comp.spawnOptions.bottom != undefined && !comp.spawnOptions.height){
		// 	comp.spawnOptions.height = comp.spawnOptions.bottom - comp.spawnOptions.top;
		// 	delete comp.spawnOptions.bottom;
		// } else if (comp.spawnOptions.bottom != undefined && comp.spawnOptions.height){
		// 	comp.spawnOptions.top = comp.spawnOptions.bottom - comp.spawnOptions.height;
		// 	delete comp.spawnOptions.bottom;
		// }

		//ensure the spawned components are added to the workspace (if they are supposed to be)
		comp.spawnOptions.addToWorkspace = addToWorkspace;
		return comp;
	});
}

const isPercentage = function(variable) {
	return typeof variable == "string" && variable.endsWith("%")
}
const processCoordinateOrDimension = function(value, groupBasisCoordinate, groupBasisDimension, roundingFn) {
	if (value != undefined){
		if (isPercentage(value)){
			value = roundingFn((parseFloat(value) / 100.0) * groupBasisDimension);
		}
		return groupBasisCoordinate + value;
	} else {
		return undefined;
	} 
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