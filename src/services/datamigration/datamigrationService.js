const Finsemble = require("@chartiq/finsemble");
const BaseService = Finsemble.baseService;
const {
	RouterClient,
	Logger,
	StorageClient,
	ConfigClient,
	LauncherClient
} = Finsemble.Clients;

ConfigClient.initialize();
Logger.start();

class DataMigrationService extends BaseService {
	constructor(args) {
		super(args);
		this.adapter = "IndexedDBAdapter";
		this.topics = ["finsemble", "finsemble.workspace", "finsemble.workspace.cache"];
		this.allData = [];
	}

	getAllData(topic) {
		let keysLength;
		let fetchedKeyCount = 0;

		return new Promise((resolve, reject) => {
			StorageClient.setStore({topic: topic, dataStore: "IndexedDBAdapter"}, (err, data) => {
				if (err) {
					reject(new Error(err));
				}

				StorageClient.keys({ topic: topic }, (err, data) => {
					if (err) {
						reject(new Error(err));
					}					

					keysLength = data.length - 1;
					Logger.log('*** datamigration keylength', data[0], `Data length ${keysLength}`);

					data.forEach((finsembleKey) => {
						Logger.log('*** datamigration datum', finsembleKey);
						StorageClient.get({ topic: topic, key: finsembleKey }, (err, response) => {
							Logger.log('*** datamigration datum', response);

							if (err) {
								reject(new Error(err));
							}
							Logger.log(`*** datamigration keys ${fetchedKeyCount}`)
							//Logger.log('*** datamigration datum get response', finsembleKey,err, response, allData);
							this.allData.push({ topic: topic, key: finsembleKey, value: response } );
							fetchedKeyCount++;

							if (fetchedKeyCount == keysLength) {
								Logger.log('*** datamigration done')
								resolve(this.allData);
							}
						});
					});
				});
			});
		});
	};

	saveAllData() {
		let migratedKeysLength = 0;

		return new Promise((resolve, reject) => {
			this.allData.forEach((datum) => {
				StorageClient.setStore({ topic: datum.topic, dataStore: "LocalStorageAdapter" }, (err, data) => {
					StorageClient.save({ topic: datum.topic, key: datum.key, value: datum.value }, (err, response) => {
						Logger.log(`*** datamigration Saved ${datum.key}`);
						migratedKeysLength++;
						if (migratedKeysLength == this.allData.length - 1) {
							resolve()
						}
					});
				});
			});
		});
	}
	/**
	 * fetchUserStatus
	 * 
	 * Determines if the user has been migrated from IndexedDBAdapter (or another storage adapter)
	 * by checking for a key in the new storage service of "migrated_from_<adapter to migrate from>", 
	 * which in this example is "migrated_from_IndexedDBAdapter".
	 */
	fetchUserStatus() {
		// @TODO determine if the user was in DB from which to migration to begin with
		StorageClient.get( { topic: "finsemble", key: `migrated_from_${this.adapter}` }, (err, data) => {
			Logger.log(`*** datamigration data from storageclient ${data}`)

			if (!data) {
				Logger.log('*** datamigration spawning migration component');

				LauncherClient.spawn("migration", {}, (err, response) => {
					RouterClient.transmit('Migration', 'needed');
					RouterClient.addListener('Migration', (err, event) => {
						if (event.data == 'begin') {
							const dataPromise = this.getAllData('finsemble');
							dataPromise.then((res) => {
								Logger.log('*** datamigration alldata', this.allData);
								const dataPromise2 = this.getAllData('finsemble.workspace');
								dataPromise2.then((res) => {
									const dataPromise3 = this.getAllData('finsemble.workspace.cache');
									dataPromise3.then((res) => {
										const promise3 = this.saveAllData();
										promise3.then((res) => {
											StorageClient.save( { topic: "finsemble", key: `migrated_from_${this.adapter}`, value: { date: Date.now() } });
											RouterClient.transmit('Migration', 'finished');
											RouterClient.transmit("Application.restart");
										});
									});
								});
							})
						}
					});
				});
			} else {
				Logger.log('*** datamigration already completed');
			}
		});
	};
}

const dms = new DataMigrationService({ 
	startupDependencies: {
		services: ["authenticationService", "configService", "storageService"]
	}
});

dms.onBaseServiceReady((callback) => {
	Logger.log('*** datamigration service ready')
	let ranMigrationCheck = false; //to make sure we only do this once, technically auth can be run multiple times
	
	RouterClient.subscribe("AuthorizationState", function(err,notify) {
		if (err) {
			Logger.log('*** datamigration failed to auth')
		} else {
			Logger.log('*** datamigration authed', notify)

			if (!ranMigrationCheck && notify.data.state == "done") {
				ranMigrationCheck = true;
				dms.fetchUserStatus();
			}	
		}
	})
	callback();
});

dms.start();
module.exports = dms;
