import { Dispatcher } from "flux";
const AppDispatcher = new Dispatcher();
import { EventEmitter } from "events";

const constants = {
	GET_STATE: "GET_STATE",
	SET_STATE: "SET_STATE"
};

/**
 * Manages state for the linker window. Since there's only ever one linker window (for now), we move it around and pass in data to populate the colors correctly. The window where the linker button is clicked is called the `attachedWindow`.
 */
var LinkerStore = Object.assign({}, EventEmitter.prototype, {
	values: {
		//linker channels that the attached window belongs to.
		channels: [],
		//WindowIdentifier for window that opened the linker.
		attachedWindowIdentifier: {},
		fittedToDOM: false
	},
	/**
	 * Getters
	 */
	getAttachedWindowIdentifier: function () {
		return this.values.attachedWindowIdentifier;
	},
	getChannels: function () {
		return this.values.channels;
	},
	getState: function () {
		return this.values;
	},
	isAccessibleLinker: function () {
		return this.accessibleLinker;
	},
	setState: function (state) {
		this.values.channels = state.channels;
		if (state.windowIdentifier) {
			this.values.attachedWindowIdentifier = state.windowIdentifier;
		}
		this.emit("stateChanged", "state");
	},
	/**
	 * Moves the linker window around and populates it with channel information.
	 */
	initialize: function () {
		var self = this;
		FSBL.Clients.RouterClient.addResponder("Finsemble.LinkerWindow.SetActiveChannels", function (error, queryMessage) {
			if (error) {
				return FSBL.Clients.Logger.system.error("Failed to add Finsemble.LinkerWindow.SetActiveChannels Responder: ", error);
			}

			self.setState(queryMessage.data);
			FSBL.Clients.Logger.system.log("toggle Linker window");
			queryMessage.sendQueryResponse(null, {});
		});

		FSBL.Clients.ConfigClient.getValue("finsemble.accessibleLinker", (err, value) => {
			if (err) {
				console.err("Error getting accessibleLinker value", err);
			}

			// Default value for accessibleLinker is true.
			self.accessibleLinker = (value && typeof value === "boolean") ? value : true;
		});
	}
});

//Handles actions dispatched by the Dispatcher.
AppDispatcher.register(function (action) {
	var actions = {};
	actions[constants.SET_STATE] = function () {
		LinkerStore.setState(action.data);
	};
	actions[constants.GET_STATE] = function () {
		LinkerStore.getState();
	};
	if (actions[action.actionType]) {
		actions[action.actionType]();
	}
});

var Actions = {
	//Retrieves data from the LinkerClient.
	getState: function () {
		let attachedWindowIdentifier = LinkerStore.getAttachedWindowIdentifier();
		AppDispatcher.dispatch({
			actionType: constants.SET_STATE,
			data: FSBL.Clients.LinkerClient.getState(attachedWindowIdentifier)
		});
	},
	// Called when the React component is mounted
	windowMounted: function () {
		FSBL.Clients.WindowClient.fitToDOM();
	},
	//Adds attached window to a linker channel.
	linkToChannel: function (channel) {
		let attachedWindowIdentifier = LinkerStore.getAttachedWindowIdentifier();
		AppDispatcher.dispatch({
			actionType: constants.SET_STATE,
			data: FSBL.Clients.LinkerClient.linkToChannel(channel, attachedWindowIdentifier)
		});
	},
	//Removes attached window from a linker channel.
	unlinkFromChannel: function (channel) {
		let attachedWindowIdentifier = LinkerStore.getAttachedWindowIdentifier();
		AppDispatcher.dispatch({
			actionType: constants.SET_STATE,
			data: FSBL.Clients.LinkerClient.unlinkFromChannel(channel, attachedWindowIdentifier)
		});
	}
};

export { LinkerStore as Store };
export { Actions };
