const FSBL = require("@chartiq/finsemble");
window.FSBL = FSBL;
FSBL.addEventListener = function (event, cb) {
	if (event == "onReady") {
		cb();
	}
};
const RouterClient = FSBL.Clients.RouterClient;
const Logger = FSBL.Clients.Logger;
Logger.start();
Logger.log("defaultWorkspacesService: starting up");

// Add and initialize any other clients you need to use
//   (services are initialised by the system, clients are not)
let WorkspaceClient = FSBL.Clients.WorkspaceClient;
WorkspaceClient.initialize();
let ConfigClient = FSBL.Clients.ConfigClient;
ConfigClient.initialize();

/**
 *
 * @constructor
 */
function defaultWorkspacesService() {
	const self = this;

	//Implement service functionality
	this.createDefaultWorkspaces = function () {
		Logger.system.debug("defaultWorkspacesService: createDefaultWorkspaces called");
		let workspaceTemplates = {}, workspaceTemplateNames = [], initialWorkspaces = [], initialWorkspaceNames = [];
		//get list of workspace templates

		ConfigClient.getValue({ field: "finsemble.workspaceTemplates" }, function (err, configWorkspaceTemplates) {
			Logger.system.debug("defaultWorkspacesService: Received workspaceTemplates", configWorkspaceTemplates);
			workspaceTemplates = configWorkspaceTemplates || {};
			workspaceTemplateNames = Object.keys(workspaceTemplates);
			Logger.system.debug("defaultWorkspacesService: Config workspaceTemplate names", workspaceTemplateNames);
			
			//get list of user workspaces
			WorkspaceClient.getWorkspaces(function (err, response) {
				Logger.system.debug("defaultWorkspacesService: User workspaces", response);
				initialWorkspaces = response;
				//produce an array of the workspace names
				for (let w=0; w<initialWorkspaces.length; w++) {
					initialWorkspaceNames.push(initialWorkspaces[w].name);
				}

				//check if templates exist as workspaces and create instances of workspaces if not present
				for (let t=0; t<workspaceTemplateNames.length; t++) {
					if (workspaceTemplateNames[t] != "Blank Template" && initialWorkspaceNames.indexOf(workspaceTemplateNames[t]) == -1 ) {
						Logger.system.debug("defaultWorkspacesService: Added workspace template", workspaceTemplateNames[t]);
						//create an instance of the workspace
						let definition = {};
						definition[workspaceTemplateNames[t]] = workspaceTemplates[workspaceTemplateNames[t]];
						WorkspaceClient.addWorkspaceDefinition({ workspaceJSONDefinition: definition , force: true }, () => { debugger; });
					}
				}

				Logger.log("defaultWorkspacesService: Finished creating default workspaces");
			});
		});
	};

	return this;
};

defaultWorkspacesService.prototype = new FSBL.baseService({
	startupDependencies: {
		// add any services or clients that should be started before your service
		services: ["workspaceService", "storageService"],
		clients: ["configClient"]
	}
});
const serviceInstance = new defaultWorkspacesService('defaultWorkspacesService');

serviceInstance.onBaseServiceReady(function (callback) {
	serviceInstance.createDefaultWorkspaces();
	Logger.log("defaultWorkspacesService: ready");
	callback();
});

serviceInstance.start();
module.exports = serviceInstance;