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

/**
 * class DataMigrationService
 * 
 * This class is configurable to migrate data from one storage adapter to another.
 * In this example, IndexedDB data is being migrated to LocalStorage for all internal Finsemble data.
 * 
 */
class DataMigrationService extends BaseService {
	constructor(args) {
		super(args);
		this.adapter = "IndexedDBAdapter";
		this.newAdapter = "LocalStorageAdapter";
	}

	/**
	 * retrieveDatabase
	 * 
	 * Takes all Storage Adapter topics provided and creates an array of objects for all topics
	 * Invokes saveAllData afterwards.
	 * 
	 * @param {Array} topics 
	 */
	retrieveDatabase(topics) {
		const keysPromises = [];

		topics.forEach((topic) => {
			keysPromises.push(new Promise((resolve, reject) => {
				StorageClient.keys({ topic: topic }, (err, keys) => {
					if (err) {
						reject(err);
					}
					const topickeypairs = [];
					keys.forEach((key) => {
						topickeypairs.push({ topic: topic, key: key });
					});
					resolve(topickeypairs);
				});
			}));

			Promise.all(keysPromises).then((allpairs) => {
				const pairs = allpairs.reduce((acc, curr) => {
					return [...acc, ...curr];
				});

				const valuesPromises = [];

				pairs.forEach((pair) => {
					valuesPromises.push(new Promise((resolve, reject) => {
						StorageClient.get({ topic: pair.topic, key: pair.key }, (err, value) => {
							if (err) {
								reject(err);
							}
							resolve({topic: pair.topic, key: pair.key, value: value});
						});
					}));
				});

				Promise.all(valuesPromises).then((data) => {
					this.saveAllData(topics, data);
				});
			})
		});
	}

	/**
	 * saveAllData
	 * 
	 * Saves data from the old storage adapter into the new one.
	 * 
	 * Invoked when all data has been retrieved from the old adapter.
	 * @param {Array} topics Array of all topics retrieved.
	 * @param {Array} data Array of all data received from retrieveDatabase
	 */
	saveAllData(topics, dataset) {
		const promiseSet = [];

		topics.forEach((topic) => {
			promiseSet.push(new Promise((resolve, reject) => {
				StorageClient.setStore({ topic: topic, dataStore: this.newAdapter }, (err, data) => {
					if (err) {
						reject(new Error(err));
					}
					resolve(data);
				});
			}));
		});

		Promise.all(promiseSet).then(() => {
			const saveSet = [];
			
			saveSet.push(new Promise((resolve, reject) => {

				dataset.forEach((datum) => {
					StorageClient.save({ topic: datum.topic, key: datum.key, value: datum.value }, (err, response) => {
						if (err) {
							reject(new Error(err));
						}
						resolve(response);
					});
				});
			}));

			Promise.all(saveSet).then(() => {
				StorageClient.save({ topic: "finsemble", key: `migrated_from_${this.adapter}`, value: Date.now() });
				RouterClient.transmit("Migration", "end");
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
		StorageClient.get({ topic: "finsemble", key: `migrated_from_${this.adapter}` }, (err, data) => {
			if (err) {
				throw new Error(err);
			}

			if (!data) {
				// The user does not have a migration record.
				
				StorageClient.keys({ topic: "finsemble"}, (err, keys) => {
					if (err) {
						throw new Error(err);
					}

					if (keys) {
						// The user has Finsemble records and thus should be migrated.

						LauncherClient.spawn("migration", {}, (err, response) => {
							RouterClient.transmit('Migration', 'needed');
							RouterClient.addListener('Migration', (err, event) => {
								if (event.data == 'begin') {
									Logger.log("*** datamigration begin")
									this.retrieveDatabase(TOPICS);
								}
							});
						});
					} else {
						// This is a new user. Set their migration record as 0 so they're not checked again.
						StorageClient.save({ topic: "finsemble", key: `migrated_from_${this.adapter}`, value: 0 });
						RouterClient.transmit("Migration", "not needed");
					}
				});
			} else {
				RouterClient.transmit("Migration", "not needed");
			}
		});
	}
}

const TOPICS = ['finsemble', 'finsemble.workspace', 'finsemble.workspace.cache'];

const dms = new DataMigrationService({ 
	startupDependencies: {
		services: ["authenticationService", "configService", "storageService"]
	}
});

dms.onBaseServiceReady((callback) => {
	let ranMigrationCheck = false; //to make sure we only do this once, as technically auth can be run multiple times
	
	RouterClient.subscribe("AuthorizationState", function(err,notify) {
		if (err) {
			Logger.log("*** datamigration failed to auth");
		} else {
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