import { INotificationService } from '../../types/notification';

const Finsemble = require("@chartiq/finsemble");
const StorageClient = Finsemble.Clients.StorageClient;
const ConfigClient = Finsemble.Clients.ConfigClient;
const Logger = Finsemble.Clients.Logger;
Logger.start();
Logger.log("feed Service starting up");

class NotificationService implements INotificationService {

	public onBaseServiceReady: Function;
	public start: Function;

	constructor(name: string) {
	}
};

ConfigClient.initialize();
StorageClient.initialize();

NotificationService.prototype = new Finsemble.baseService({
	startupDependencies: {
		services: [],
		clients: ["configClient", "storageClient"] 
	}
});

const serviceInstance = new NotificationService("notificationService");

serviceInstance.onBaseServiceReady((callback) => {
	Logger.log("notificationService Service ready");
	callback();
});

serviceInstance.start();
module.exports = serviceInstance;