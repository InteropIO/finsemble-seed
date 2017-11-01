/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/

var BaseClient = require("./baseClient");
var util = require("../common/util");
var Validate = require("../common/validate"); // Finsemble args validator
var Logger = require("./logger");

Logger.system.log("Starting WorkspaceClient");

/**
 * @introduction
 * <h2>Workspace Client</h2>
 * ----------
 * The workspace client manages all calls to load, save, rename, and delete workspaces. Before reading this, please check out [Understanding Workspaces]{@tutorial workspaces}.
 * @hideConstructor true
 * @constructor
 * @summary You don't need to ever invoke the constructor. This is done for you when WindowClient is added to the FSBL object.
 */
function WorkspaceClient(params) {
	Validate.args(params, "object=") && params && Validate.args2("params.onReady", params.onReady, "function=");
	/** @alias WorkspaceClient# */
	BaseClient.call(this, params);

	var self = this;

	/**
	* List of all workspaces within the application.
	* @type WorkspaceClient
	*/
	this.workspaces = [];

	/**
	* Reference to the activeWorkspace object
	* @type WorkspaceClient
	*/
	this.activeWorkspace = {};

	/**
	 * Adds window to active workspace.
	 * @private
	 * @param {object} params
	 * @param {string} params.name Window name
	 * @param {function} cb Callback
	 */
	this.addWindow = function (params, cb) {
		Validate.args(params, "object", cb, "function=") && params && Validate.args2("params.name", params.name, "string");
		cb = cb || function noop() { }; // cb is optional but not for underlying query
		this.routerClient.query("WorkspaceService.addWindow", params, cb);
	};
	/**
	 * AutoArranges windows.
	 * @param {object} 	[params] Parameters
	 * @param {string} [params.monitor] Same options as {@link LauncherClient#showWindow}. Default is monitor of calling window.
	 * @param {function=} cb Callback
	 * @example
	 * FSBL.Clients.WorkspaceClient.autoArrange(function(err, response){
	 * 		//do something after the autoarrange, maybe make all of the windows flash or notify the user that their monitor is now tidy.
	 * });
	 */
	this.autoArrange = function (params, cb) {
		Validate.args(params, "object", cb, "function=");
		cb = cb || function noop() { }; // cb is optional but not for underlying query
		params = params ? params : {};
		FSBL.Clients.LauncherClient.getMonitorInfo({
			windowIdentifier: FSBL.Clients.LauncherClient.myWindowIdentifier
		}, function (err, dimensions) {
			params.monitorDimensions = dimensions.unclaimedRect;
			self.routerClient.query("DockingService.autoArrange", params, cb);
		});
	};
	/**
	 * Brings all windows to the front.
	 * @param {object} params
	 * @param {string} 	[params.monitor] Same options as {@link LauncherClient#showWindow} except that "all" will work for all monitors. Defaults to the monitor for the current window.
	 * @param {function} [cb] Callback.
	 * @todo rename to something like <code>bringToFront</code> and put the 'Only affects visible windows' bit in the documentation.
	 * @example
	 * FSBL.Clients.WorkspaceClient.bringWindowsToFront();
	 */
	this.bringWindowsToFront = function (params, cb) {
		Validate.args(params, "object", cb, "function=");
		cb = cb || function noop() { }; // cb is optional but not for underlying query
		params = params ? params : {};
		util.getMyWindowIdentifier(function (myWindowIdentifier) {
			if (!params.windowIdentifier) {
				params.windowIdentifier = myWindowIdentifier;
			}
			self.routerClient.query("WorkspaceService.bringWindowsToFront", params, cb);
		});
	};

	/**
	 * Gets the currently active workspace.
	 * @param {function} cb Callback
	 * @example <caption>This function is useful for setting the initial state of a menu or dialog. It is used in the toolbar component to set the initial state.</caption>
	 *
	FSBL.Clients.WorkspaceClient.getActiveWorkspace(function (err, response) {
		//setState is a React component method.
		self.setState({
			workspaces: response
		});
	});
	 */
	this.getActiveWorkspace = function (cb) {
		Validate.args(cb, "function");

		cb(null, this.activeWorkspace);

	};

	/**
	 * Returns the list of saved workspaces.
	 * @param {function} cb Callback
	 * @example <caption>This function is useful for setting the initial state of a menu or dialog.</caption>
	 *
	FSBL.Clients.WorkspaceClient.getWorkspaces(function (err, response) {
		//setState is a React component method.
		self.setState({
			workspaces: response
		});
	});
	 */
	this.getWorkspaces = function (cb) {
		Validate.args(cb, "function");
		this.routerClient.query("WorkspaceService.getWorkspaces", null,
			function getWorkspacesCallback(err, response) {
				if (err) {
					return Logger.system.error(err);
				}
				if (response) {
					cb(err, response.data);
				} else {
					cb(err, null);
				}
			});
	};

	/**
	 * Removes a workspace. Either the workspace object or its name must be provided.
	 * @param {object} params
	 * @param {Boolean}	[params.persist=false] Whether to persist the change.
	 * @param {Object} 	[params.workspace] Workspace
	 * @param {string} 	[params.name] Workspace Name
	 * @param {function=} cb Callback to fire after 'Finsemble.WorkspaceService.update' is transmitted.
	 * @example <caption>This function removes 'My Workspace' from the main menu and the default storage tied to the applicaton.</caption>
	 * FSBL.Clients.WorkspaceClient.remove({
		name: 'My Workspace',
		persist: true
	  }, function(err, response){
	 		//You typically won't do anything here. If you'd like to do something when a workspace change happens, we suggest listening on the `Finsemble.WorkspaceService.update` channel.
	  });
	 */

	this.remove = function (params, cb) {
		Validate.args(params, "object", cb, "function=") && !(params.name || params.workspace) && Validate.args2("params.name", params.name, "string");
		cb = cb || function noop() { }; // cb is optional but not for underlying query

		if (typeof (params.workspace !== undefined) && (params.workspace === self.activeWorkspace)) {
			cb("Error: Cannot remove active workspace " + self.activeWorkspace.name, null);
			Logger.system.debug("attempt to remove active workspace:" + self.activeWorkspace.name);
		} else if (typeof (params.name !== undefined) && (params.name === self.activeWorkspace.name)) {
			cb("Error: Cannot remove active workspace name " + self.activeWorkspace.name, null);
			Logger.system.debug("attempt to remove active workspace name:" + self.activeWorkspace.name);
		} else { // remove the inactive workspace
			var defaultParams = {
				persist: false,
				workspace: null,
				name: null
			};
			//sets defaults for undefined params.
			params.prototype = Object.create(defaultParams);
			this.routerClient.query("WorkspaceService.remove", params,
				function removeWorkspaceCallback(err, response) {
					if (err) {
						return Logger.system.error(err);
					}

					if (response) {
						cb(err, "success");
					} else {
						cb(err, null);
					}
				});
		}
	};
	/**
	 * Removes window from active workspace.
	 * @param {object} params
	 * @param {string} params.name Window name
	 * @param {function=} [cb] Callback
	 * @example <caption>This method removes a window from a workspace. It is rarely called by the developer. It is called when a window that is using the window manager is closed. That way, the next time the app is loaded, that window is not spawned.</caption>
	 *FSBL.Clients.WorkspaceClient.removeWindow({name:windowName}, function(err, response){
		 //do something after removing the window.
	 });
	 */
	this.removeWindow = function (params, cb) {
		Validate.args(params, "object", cb, "function=") && Validate.args2("params.name", params.name, "string");
		cb = cb || function noop() { }; // cb is optional but not for underlying query
		this.routerClient.query("WorkspaceService.removeWindow", params,
			function removeWindowCallback(err, response) {
				if (err) {
					return Logger.system.error(err);
				}
				if (response) {
					cb(err, response.data);
				} else {
					cb(err, null);
				}
			});
	};

	/**
	 * Renames the workspace with the provided name. Also removes all references in storage to the old workspace's name.
	 * @param {object} params
	 * @param {string} params.oldName Name of workspace to rename.
	 * @param {string} params.newName What to rename the workspace to.
	 * @param {boolean=} [params.removeOldWorkspace=true] Whether to remove references to old workspace after renaming.
	 * @param {boolean=} [params.overwriteExisting=false] Whether to overwrite an existing workspace.
	 * @param {function=} cb Callback
	 * @example <caption>This method is used to rename workspaces. It is used in the main Menu component.</caption>
	 * FSBL.Clients.WorkspaceClient.rename({
		oldName: 'My Workspace',
		newName: 'The best workspace',
		removeOldWorkspace: true,
	  }, function(err, response){
	 		//Do something.
	  });
	 */
	this.rename = function (params, cb) {
		Validate.args(params, "object", cb, "function=") && Validate.args2("params.oldName", params.oldName, "string", "params.newName", params.newName, "string");
		cb = cb || function noop() { }; // cb is optional but not for underlying query
		if (!params.overwriteExisting && this.workspaceIsAlreadySaved(params.newName)) {
			cb(new Error("WorkspaceAlreadySaved"), params);
			return;
		}
		this.routerClient.query("WorkspaceService.rename", params,
			function renameWorkspaceCallback(err, response) {
				Logger.system.log("IN THE RENAME CALLBACK", err, response.data);
				if (err) {
					return Logger.system.error(err);
				}
				if (response) {
					cb(err, response.data);
				} else {
					cb(err, null);
				}
			});
	};

	/**
	 * Makes a clone (i.e. copy) of the workspace.  The active workspace is not affected.
	 * @param {object} params
	 * @param {string} params.name Name of workspace to clone.
	 * @param {function} Callback cb(err,response) with response set to the name of the cloned workspace if no error
	 * @example <caption>This method is used to clone workspaces. </caption>
	 * FSBL.Clients.WorkspaceClient.clone({
		name: 'The best workspace'
	  }, function(err, response){
	 		//Do something.
	  });
	 */
	this.clone = function (params, cb) {
		Validate.args(params, "object", cb, "function=") && Validate.args2("params.name", params.name, "string");
		cb = cb || function noop() { }; // cb is optional but not for underlying query
		this.routerClient.query("WorkspaceService.clone", params,
			function cloneWorkspaceCallback(err, response) {
				if (err) {
					return Logger.system.error(err);
				}
				if (response) {
					cb(err, response.data.newWorkspaceName);
				} else {
					cb(err, null);
				}
			});
	};

	/**
	 * Saves the currently active workspace. It does not overwrite the saved instance of the workspace. It simply overwrites the <code>activeWorkspace</code> key in storage.
	 * @param {function} cb Callback
	 * @example
	 * <caption>This function persists the currently active workspace.</caption>
	 * FSBL.Clients.WorkspaceClient.save(function(err, response){
	 		//Do something.
	  });
	 */
	this.save = function (cb) {
		Validate.args(cb, "function=");
		cb = cb || function noop() { }; // cb is optional but not for underlying query
		this.routerClient.query("WorkspaceService.save", null, cb);
	};
	/**
	 * Helper that tells us whether a workspace is saved.
	 * @private
	 */
	this.workspaceIsAlreadySaved = function (workspaceName) {
		Validate.args(workspaceName, "string");
		var savedWorkspaceIndex = -1;
		for (var i = 0; i < self.workspaces.length; i++) {
			if (workspaceName === self.workspaces[i].name) {
				return true;
			}
		}
		return false;
	};
	/**
	 *
	 * Saves the currently active workspace with the provided name.
	 * @param {object} params
	 * @param {string} params.name new name to save workspace under.
	 * @param {string} [params.force=false] Whether to overwrite a workspace already saved with the provided name.
	 * @param {function} cb Callback
	 * @example <caption>This function persists the currently active workspace with the provided name.</caption>
	 * FSBL.Clients.WorkspaceClient.saveAs({
		name: 'My Workspace',
	  }, function(err, response){
	 		//Do something.
	  });
	 */
	this.saveAs = function (params, cb) {
		Validate.args(params, "object", cb, "function=") && Validate.args2("params.name", params.name, "string");
		cb = cb || function noop() { }; // cb is optional but not for underlying query

		if (!params.force && this.workspaceIsAlreadySaved(params.name)) {
			cb(new Error("WorkspaceAlreadySaved"), null);
			return;
		}
		this.routerClient.query("WorkspaceService.saveAs", params,
			function workspaceSaveAsCallback(err, response) {
				if (err) {
					return Logger.system.error(err);
				}
				if (response) {
					cb(err, response.data);
				} else {
					cb(err, null);
				}
			});
	};

	/**
	 * Switches to a workspace.
	 * @param {object} params
	 * @param {string} 	params.name Workspace Name
	 * @param {function} cb Callback
	 * @example <caption>This function loads the workspace 'My Workspace' from the storage tied to the application.</caption>
	 * FSBL.Clients.WorkspaceClient.switchTo({
		name: 'My Workspace',
	  }, function(err, response){
	 		//Do something.
	  });
	 */
	this.switchTo = function (params, cb) {
		Logger.system.debug("switchTo " + params.name);
		Validate.args(params, "object", cb, "function") && Validate.args2("params.name", params.name, "string");
		// not the workspace will be undated in this client before the below query response is received (see 'Finsemble.orkspaceService.update' listener)
		this.routerClient.query("WorkspaceService.switchTo", params, function (err, response) {
			Logger.system.log("SWITCH TO CB");
			var res = null;
			if (err) {
				Logger.system.error(err);
			} else {
				self.activeWorkspace = response.data;
				res = self.activeWorkspace;
			}
			if (cb) {
				cb(err, res);
			}
		});
	};

	/**
	 * Checks to see if the workspace is dirty. If it's already dirty, the window doesn't need to compare its state to the saved state.
	 * @param {Function} Callback cb(err,response) with response set to true if dirty and false otherwise (when no error)
	 * @example <caption>This function will let you know if the activeWorkspace is dirty.</caption>
	 * FSBL.Clients.WorkspaceClient.isWorkspaceDirty(function(err, response){
	 		//Do something like prompt the user if they'd like to save the currently loaded workspace before switching.
	  });
	 */
	this.isWorkspaceDirty = function (cb) {
		Validate.args(cb, "function");
		cb(null, this.activeWorkspace.isDirty);
	};
	/**
	 * Creates a new workspace. If the name is already saved, we increment the name.  After creation the new workspace becomes the active workspace.
	 * @param {Function} Callback cb(err,response) with response set to new workspace object if no error
	 * @example <caption>This function creates the workspace 'My Workspace'.</caption>
	 * FSBL.Clients.WorkspaceClient.createNewWorkspace(function(err, response){
	 *		if (!err) {}
	 *			//Do something like notify the user that the workspace has been created.
	 *		}
	 * });
	 */
	this.createNewWorkspace = function (workspaceName, cb) {
		Logger.system.debug("ActiveWorkSpace Name Before Create=" + this.activeWorkspace.name);
		Validate.args(cb, "function");
		var workspaces = FSBL.Clients.WorkspaceClient.workspaces;
		var numberOfNewWorkspaces = 0;
		var modifier = 1;
		workspaces.forEach((workspace, i) => {
			if (workspace.name.includes(workspaceName)) {
				numberOfNewWorkspaces++;
				var matches = workspace.name.match(/(\d+)(\))/);
				if (matches && typeof (matches[1] !== undefined) && (modifier <= matches[1])) {
					modifier = parseInt(matches[1]) + 1;
				}
			}
		});

		if (numberOfNewWorkspaces) {
			workspaceName += " (" + modifier + ")";
		}
		Logger.system.debug("New Workspace Name =" + workspaceName);
		this.switchTo({ name: workspaceName }, cb);
	};

	this.getGroupData = function (cb) {
		cb(this.activeWorkspace.groups);
	};
	this.saveGroupData = function (data) {
		this.routerClient.transmit("WorkspaceService.saveGroupData", {
			groupData: data
		});
	};
	/**
	 * Initializes listeners and sets default data on the WorkspaceClient object.
	 * @private
	 */
	this.start = function (cb) {
		/**
		 * Initializes the workspace's state.
		 */

		this.routerClient.subscribe("Finsemble.WorkspaceService.update", function (err, response) {
			if (response.data && response.data.activeWorkspace) {
				self.workspaceIsDirty = response.data.activeWorkspace.isDirty;
				self.workspaces = response.data.workspaces;
				self.activeWorkspace = response.data.activeWorkspace;
			}
		});

		self.getActiveWorkspace(function (err, response) {
			self.activeWorkspace = response;
			self.getWorkspaces(function (err2, response2) {
				self.workspaces = response2;
				Logger.system.log("workspace client ready");
				if (cb) {
					cb();
				}
			});
		});
	};

	return this;
}

var workspaceClient = new WorkspaceClient({
	onReady: function (cb) {
		Logger.system.debug("workspace onReady");
		workspaceClient.start(cb);
	},
	name: "workspaceClient"
});

workspaceClient.requiredClients = ["launcherClient"];
workspaceClient.requiredServices = ["workspaceService", "storageService"];
//workspaceClient.initialize();

module.exports = workspaceClient;