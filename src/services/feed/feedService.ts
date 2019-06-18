import { IFeedService } from '../../types/feed';

const Finsemble = require("@chartiq/finsemble");
const Logger = Finsemble.Clients.Logger;
Logger.start();
Logger.log("feed Service starting up");

class FeedService implements IFeedService {

	public onBaseServiceReady: Function;
	public start: Function;

	constructor(name: string) {}

};

FeedService.prototype = new Finsemble.baseService({
	startupDependencies: {
		services: [],
		clients: [] 
	}
});

const serviceInstance = new FeedService("feedService");

serviceInstance.onBaseServiceReady((callback) => {
	Logger.log("feed Service ready");
	callback();
});

serviceInstance.start();
module.exports = serviceInstance;