const Finsemble = require("@finsemble/finsemble-core");

Finsemble.Clients.Logger.start();
Finsemble.Clients.Logger.log("OfficeAddin Service starting up");

// Add and initialize any other clients you need to use (services are initialized by the system, clients are not):
// Finsemble.Clients.AuthenticationClient.initialize();
// Finsemble.Clients.ConfigClient.initialize();
// Finsemble.Clients.DialogManager.initialize();
// Finsemble.Clients.DistributedStoreClient.initialize();
// Finsemble.Clients.DragAndDropClient.initialize();
// Finsemble.Clients.LauncherClient.initialize();
// Finsemble.Clients.LinkerClient.initialize();
// Finsemble.Clients.HotkeyClient.initialize();
// Finsemble.Clients.SearchClient.initialize();
// Finsemble.Clients.StorageClient.initialize();
// Finsemble.Clients.WindowClient.initialize();
// Finsemble.Clients.WorkspaceClient.initialize();

/**
 * Add service description here
 */
class OfficeAddinService extends Finsemble.baseService {
	/**
	 * Initializes a new instance of the OfficeAddinService class.
	 */
	constructor() {
		super({
			// Declare any client dependencies that must be available before your service starts up.
			startupDependencies: {
				// When ever you use a client API with in the service, it should be listed as a client startup
				// dependency. Any clients listed as a dependency must be initialized at the top of this file for your
				// service to startup.
				clients: [
					// "authenticationClient",
					// "configClient",
					// "dialogManager",
					// "distributedStoreClient",
					// "dragAndDropClient",
					// "hotkeyClient",
					// "launcherClient",
					// "linkerClient",
					// "searchClient
					// "storageClient",
					// "windowClient",
					// "workspaceClient",
				],
			},
		});

		this.readyHandler = this.readyHandler.bind(this);

		this.onBaseServiceReady(this.readyHandler);
	}

	/**
	 * Fired when the service is ready for initialization
	 * @param {function} callback
	 */
	readyHandler(callback) {
		this.createRouterEndpoints();
		Finsemble.Clients.Logger.log("OfficeAddin Service ready");

		//Finsemble.Clients.RouterClient.query("finsemble-excel-query", { action:'getCellData', row:1, col:1, sheetName: 'Sheet1' }, this.handleQueryResponse);
		//Finsemble.Clients.RouterClient.query("finsemble-excel-query", { action:'getRangeData', startCell:'A1', endCell:'C3', sheetName: 'Sheet1' }, this.handleQueryResponse);
		Finsemble.Clients.RouterClient.query("finsemble-excel-query", { action:'createWorksheet', worksheetName: 'test5'},this.handleQueryResponse)
		//Finsemble.Clients.RouterClient.query("finsemble-excel-query", { action:'createWorkbook', workbookName: 'test1'},this.handleQueryResponse)
		
		callback();
	}

	handleQueryResponse = (err, res) => {
		if (!err) {
			console.log(res);
		}
	}

	handleExcelEvent = (err, res) => {
		if (err) {
			Finsemble.Clients.Logger.error("OfficeAddinService error when handling router message", err)
		} else {
			if(!res.originatedHere()){
				// Only handle messages not from the service ifself
				console.log(res.data)
			}
		}
	}

	/**
	 * Creates a router endpoint for you service.
	 * Add query responders, listeners or pub/sub topic as appropriate.
	 */
	createRouterEndpoints() {
		Finsemble.Clients.RouterClient.addListener("finsemble-excel-event", this.handleExcelEvent)

	}
}

const serviceInstance = new OfficeAddinService();

serviceInstance.start();
