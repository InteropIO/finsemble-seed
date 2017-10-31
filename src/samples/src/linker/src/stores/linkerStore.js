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
		//linker groups that the attached window belongs to.
		groups: [],
		//WindowIdentifier for window that opened the linker.
		attachedWindowIdentifier: {}
	},
	/**
	 * Getters
	 */
	getAttachedWindowIdentifier: function () {
		return this.values.attachedWindowIdentifier;
	},
	getGroups: function () {
		return this.values.groups;
	},
	getState: function () {
		return this.values;
	},
	setState: function (state) {
		LinkerStore.values.groups = state.groups;
		if (state.windowIdentifier) {
			LinkerStore.values.attachedWindowIdentifier = state.windowIdentifier;
		}
		this.emit("stateChanged", "state");
	},
	/**
	 * Moves the linker window around and populates it with group information.
	 */
	initialize: function () {
		var self = this;
		FSBL.Clients.RouterClient.addResponder("Finsemble.LinkerWindow.Show", function (error, queryMessage) {
			if (error) {
				return FSBL.Clients.Logger.system.error("Failed to add Finsemble.LinkerWindow.Show Responder: ", error);
			}
			var data = queryMessage.data;
			var finWindow = FSBL.Clients.WindowClient.finWindow;

			self.setState(data);
			FSBL.Clients.WindowClient.fitToDOM();

			finWindow.showAt(data.windowBounds.left, data.windowBounds.top + 20, function () {
			});

			finWindow.focus();
			queryMessage.sendQueryResponse(null, data);
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
		FSBL.Clients.LinkerClient.getState(attachedWindowIdentifier, function (err, response) {
			if (err) {
				FSBL.Clients.Logger.system.verbose("err", err);
			}
			AppDispatcher.dispatch({
				actionType: constants.SET_STATE,
				data: response
			});

		});
	},
	//Adds attached window to a linker group.
	addToGroup: function (group) {
		let attachedWindowIdentifier = LinkerStore.getAttachedWindowIdentifier();
		FSBL.Clients.LinkerClient.addToGroup(group, attachedWindowIdentifier, function (err, response) {
			if (err) {
			}
			AppDispatcher.dispatch({
				actionType: constants.SET_STATE,
				data: response
			});

		});
	},
	//Removes attached window from a linker group.
	removeFromGroup: function (group) {
		let attachedWindowIdentifier = LinkerStore.getAttachedWindowIdentifier();
		FSBL.Clients.LinkerClient.removeFromGroup(group, attachedWindowIdentifier, function (err, response) {
			if (err) {
			}
			AppDispatcher.dispatch({
				actionType: constants.SET_STATE,
				data: response
			});
		});
	}
};

export { LinkerStore as Store };
export { Actions };
