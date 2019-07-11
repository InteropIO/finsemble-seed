/**
 * Write message to console and to the component.
 * 
 * @param {string} message The message to log.
 */
const log = (message) => {
	console.log(`Group Update Reproducer: ${message}`);
	if (!document.getElementById("messages")) {
		// Create messages if it doesn't exist.
		const messagesDiv = document.createElement("div");
		messagesDiv.id = "messages";
		document.body.appendChild(messagesDiv);
	}

	const messagesDiv = document.getElementById("messages");

	if (!messagesDiv) {
		// No message DIV. Cannot log to HTML.
		return;
	}
	
	const messageEl = document.createElement("div");
	const messageText = document.createTextNode(`${message}\n`);
	messageEl.appendChild(messageText);
	messagesDiv.appendChild(messageEl);
	messagesDiv.appendChild(document.createElement("br"));
}

/**
 * Handles the group update event.
 * 
 * @param {*} err The error object. Null if there is no error
 * @param {*} res The response from group update
 */
const groupUpdateHandler = (err, res) => {
	if (err) {
		log(`ERROR - Group update: ${err}`);
		FSBL.Clients.Logger.error(err);
		return;
	}
	debugger;

	const windowNameForDocking = FSBL.Clients.WindowClient.getWindowNameForDocking();
	log(`Getting docking state for "${windowNameForDocking}"`);
	const dockingState = determineDockingState(res.data.groupData, windowNameForDocking);
	log(`Docking state: ${dockingState}`);
};

/**
 * Determines whether the window is separate, adjacent or connected to another window for grouping.
 * @param {string[]} groups Array of current groups 
 * @param {string} windowName The name of the window to check
 * @returns The docking state
 */
const determineDockingState = (groups, windowName) => {
	// Get groups that include the window name passed in
	const windowGroups = Object.values(groups).filter(group => group.windowNames.includes(windowName));

	// Default docking state is separate
	let dockingState = "DockingState.Separate";

	// If the window name is in a group, the state isn't the default.
	if (windowGroups.length > 0) {
		// If one of the groups the window is in is moveable, the window is connected, otherwise it is adjacent.
		dockingState = windowGroups.some(group => group.isMovable) ? "DockingState.Connected" : "DockingState.Adjacent";
	}

	return dockingState;
}

const FSBLReady = async () => {
	try {
		log(`Window name for docking: ${FSBL.Clients.WindowClient.getWindowNameForDocking()}`);
		FSBL.Clients.RouterClient.subscribe("Finsemble.WorkspaceService.groupUpdate", groupUpdateHandler);
	} catch (e) {
		FSBL.Clients.Logger.error(e);
	}
}

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", FSBLReady)
} else {
	window.addEventListener("FSBLReady", FSBLReady)
}

//@ sourceURL=bestScript.js
