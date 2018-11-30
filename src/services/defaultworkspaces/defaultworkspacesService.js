const FSBL = require("@chartiq/finsemble");
window.FSBL = FSBL;
FSBL.addEventListener = function (event, cb) {
	if (event == "onReady") {
		cb();
	}
}
const RouterClient = FSBL.Clients.RouterClient;
const Logger = FSBL.Clients.Logger;
Logger.start();
Logger.log("defaultWorkspaces Service starting up");

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
		Logger.system.debug("defaultWorkspaceService: createDefaultWorkspaces called");
		let workspaceTemplates = {}, workspaceTemplateNames = [], initialWorkspaces = [], initialWorkspaceNames = [];
		//get list of workspace templates

		ConfigClient.getValue({ field: "finsemble.workspaceTemplates" }, function (err, configWorkspaceTemplates) {
			Logger.system.debug("defaultWorkspaceService: Received workspaceTemplates", configWorkspaceTemplates);
			workspaceTemplates = configWorkspaceTemplates || {};
			workspaceTemplateNames = Object.keys(workspaceTemplates);
			Logger.system.debug("defaultWorkspaceService: Config workspaceTemplate names", workspaceTemplateNames);
			
			//get list of user workspaces
			WorkspaceClient.getWorkspaces(function (err, response) {
				Logger.system.debug("defaultWorkspaceService: User workspaces", response);
				initialWorkspaces = response;
				//produce an array of the workspace names
				for (let w=0; w<initialWorkspaces.length; w++) {
					initialWorkspaceNames.push(initialWorkspaces[w].name);
				}

				//check if templates exist as workspaces and create instances of workspaces if not present
				for (let t=0; t<workspaceTemplateNames.length; t++) {
					if (workspaceTemplateNames[t] != "Blank Template" && initialWorkspaceNames.indexOf(workspaceTemplateNames[t]) == -1 ) {
						Logger.system.debug("defaultWorkspaceService: Added workspace template", workspaceTemplateNames[t]);
						//create an instance of the workspace
						let definition = {};
						definition[workspaceTemplateNames[t]] = workspaceTemplates[workspaceTemplateNames[t]];
						WorkspaceClient.addWorkspaceDefinition({ workspaceJSONDefinition: definition , force: true }, () => { debugger; });
					}
				}

				Logger.log("defaultWorkspaceService: Finished creating default workspaces");
			});
		});
	}


	/**
	 * Creates a router endpoint for you service.
	 * Add query responders, listeners or pub/sub topic as appropriate.
	 * @private
	 */
	this.createRouterEndpoints = function () {
		//Example router integration which uses a single query responder to expose multiple functions
		// RouterClient.addResponder("defaultWorkspaces functions", function(error, queryMessage) {
		// 	if (!error) {
		// 		Logger.log('defaultWorkspaces Query: ' + JSON.stringify(queryMessage));

		// 		if (queryMessage.data.query === "myFunction") {
		// 			try {
		// 				queryMessage.sendQueryResponse(null, self.myFunction());
		// 			} catch (err) {
		// 				queryMessage.sendQueryResponse(err);
		// 			}
		// 		} else {
		// 			queryMessage.sendQueryResponse("Unknown defaultWorkspaces query function: " + queryMessage, null);
		// 			Logger.error("Unknown defaultWorkspaces query function: ", queryMessage);
		// 		}
		// 	} else {
		// 		Logger.error("Failed to setup defaultWorkspaces query responder", error);
		// 	}
		// });
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
	serviceInstance.createRouterEndpoints();
	Logger.log("defaultWorkspaces Service ready");
	serviceInstance.createDefaultWorkspaces();
	callback();
});

serviceInstance.start();
module.exports = serviceInstance;