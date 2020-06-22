import ISubscription from "./ISubscription";
import INotification from "./INotification";
import IFilter from "./IFilter";
import { OnNotificationCallback } from "./Callbacks";

export default class Subscription implements ISubscription {
	id: string;
	filter: IFilter;
	onNotification: OnNotificationCallback;

	/**
	 *
	 * @param {string|null} id
	 * @param {IFilter[]|null} filter
	 * @param onNotification
	 */
	constructor(id?: string, filter?: IFilter, onNotification?: (notification: INotification) => void) {
		this.id = id ? id : null;
		this.filter = filter;
		this.onNotification = onNotification ? onNotification : null;
	}
}
