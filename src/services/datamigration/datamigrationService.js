const Finsemble = require("@chartiq/finsemble");
const BaseService = Finsemble.baseService;
const {
	RouterClient,
	Logger,
	StorageClient,
} = Finsemble.Clients;

StorageClient.initialize();
Logger.start();

class DataMigrationService extends BaseService {
	constructor() {
		super();
		const adapter = "IndexedDBAdapter";
	}
	
	fetchUserStatus = function() {
		// @TODO determine if the user was in DB from which to migration to begin with
		StorageClient.get( { topic: "finsemble", key: `migrated_from_${this.adapter}` }, (err, data) => {
			RouterClient.transmit('Migration', { topic: 'migrationStatus', status: (!data) ? false : true });
		});
	};

	migrateData = function() {
		RouterClient.transmit('Migration', { topic: 'migrationStart'});
	};

	/**
	 * Creates a router endpoint for you service. 
	 * Add query responders, listeners or pub/sub topic as appropriate. 
	 * @private
	 */
	createRouterEndpoints = function () {
		RouterClient.addListener("Migration", (error, event) => {
			switch (event.data.topic) {
				case "migrationCheck":
					this.fetchUserStatus();
					break;
				case "migrationStatus":
					if (!event.data.status) {
						this.migrateData();
					}
					break;
			}
		});

		RouterClient.addListener("AuthenticationService.authorization", (error, event) => {
			StorageClient.setUser({ user: event.data.user}, (err, response) => {
				RouterClient.transmit("Migration", { topic: "migrationCheck"});
			});
		});
	};
}

const dms = new DataMigrationService('datamigrationService');

dms.onBaseServiceReady((callback) => {
	dms.createRouterEndpoints();
	callback();
});

dms.start();
module.exports = dms;