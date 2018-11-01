const Finsemble = require("@chartiq/finsemble");
const RouterClient = Finsemble.Clients.RouterClient;
const Logger = Finsemble.Clients.Logger;
Logger.start();
Logger.log("defaultworkspaces Service starting up");

// Add and initialize any other clients you need to use 
//   (services are initialised by the system, clients are not)
let WorkspaceClient = Finsemble.Clients.WorkspaceClient;
WorkspaceClient.initialize();
let ConfigClient = Finsemble.Clients.ConfigClient;
ConfigClient.initialize();

/**
 * 
 * @constructor
 */
function defaultworkspacesService() {
	const self = this;

	//Implement service functionality
	this.createDefaultWorkspaces = function () {

		let workspaceTemplates = {}, workspaceTemplateNames = [], initialWorkspaces = [], initialWorkspaceNames = [];
		//get list of workspace templates

		ConfigClient.getValue({ field: "finsemble.workspaceTemplates" }, function (err, configWorkspaceTemplates) {
			workspaceTemplates = configWorkspaceTemplates || {};
			workspaceTemplateNames = Object.keys(workspaceTemplates);
			Logger.system.debug("Config workspaceTemplate names", workspaceTemplateNames);

			//get list of user workspaces
			WorkspaceClient.getWorkspaces(function (err, response) {
				initialWorkspaces = response;
				//produce an array of the workspace names
				for (let w=0; w<initialWorkspaces.length; w++) {
					initialWorkspaceNames.push(initialWorkspaces[w].name);
				}

				//check if templates exist as workspaces and create instances of workspaces if not present
				for (let t=0; t<workspaceTemplateNames.length; t++) {
					if (workspaceTemplateNames[t] != "Blank Template" && initialWorkspaceNames.indexOf(workspaceTemplateNames[t] == -1)) {
						//create an instance of the workspace
						WorkspaceClient.createNewWorkspace(
							workspaceTemplateNames[t], 
							{templateName: workspaceTemplateNames[t], switchAfterCreation: false}, 
							function(err, response){
								Logger.log("Created default workspace: " + workspaceTemplateNames[t]);
							}
							//probably ought to wait here for it to be created before jumping to next loop iteration
						);
					}
				}

				Logger.log("Finished creating default workspaces");
			});
		});
	}


	this.myFunction = function () {
		return "some dummy data";
	}

	/**
	 * Creates a router endpoint for you service. 
	 * Add query responders, listeners or pub/sub topic as appropriate. 
	 * @private
	 */
	this.createRouterEndpoints = function () {
		//Example router integration which uses a single query responder to expose multiple functions
		RouterClient.addResponder("defaultworkspaces functions", function(error, queryMessage) {
			if (!error) {
				Logger.log('defaultworkspaces Query: ' + JSON.stringify(queryMessage));
				
				if (queryMessage.data.query === "myFunction") {
					try {
						queryMessage.sendQueryResponse(null, self.myFunction());
					} catch (err) {
						queryMessage.sendQueryResponse(err);
					}
				} else {
					queryMessage.sendQueryResponse("Unknown defaultworkspaces query function: " + queryMessage, null);
					Logger.error("Unknown defaultworkspaces query function: ", queryMessage);
				}
			} else {
				Logger.error("Failed to setup defaultworkspaces query responder", error);
			}
		});	
	};

	return this;
};

defaultworkspacesService.prototype = new Finsemble.baseService({
	startupDependencies: {
		// add any services or clients that should be started before your service
		services: ["workspaceService", "storageService"],
		clients: ["configClient"]
	}
});
const serviceInstance = new defaultworkspacesService('defaultworkspacesService');

serviceInstance.onBaseServiceReady(function (callback) {
	serviceInstance.createRouterEndpoints();
	Logger.log("defaultworkspaces Service ready");
	serviceInstance.createDefaultWorkspaces();
	callback();
});

serviceInstance.start();
module.exports = serviceInstance;