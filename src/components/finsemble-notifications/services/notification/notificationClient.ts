/* eslint-disable @typescript-eslint/ban-ts-ignore */
import INotificationClient from "../../types/Notification-definitions/INotificationClient";
import INotification from "../../types/Notification-definitions/INotification";
import IFilter from "../../types/Notification-definitions/IFilter";
import IAction from "../../types/Notification-definitions/IAction";
import ISubscription from "../../types/Notification-definitions/ISubscription";
import RouterWrapper, { ROUTER_ENDPOINTS, ROUTER_NAMESPACE } from "../helpers/RouterWrapper";
import { ActionTypes } from "../../types/Notification-definitions/ActionTypes";
import { IRouterClient } from "../../types/FSBL-definitions/clients/IRouterClient";
import { ILogger } from "../../types/FSBL-definitions/clients/logger.interface";
import OnSubscriptionSuccessCallback, {
	OnNotificationCallback,
	OnSubscriptionFaultCallback
} from "../../types/Notification-definitions/Callbacks";

const { Logger } = require("@chartiq/finsemble").Clients;
const FSBL = window.FSBL;

/**
 * Notification Client
 *
 * Used to send, receive and manipulate notifications
 *
 */
export default class NotificationClient implements INotificationClient {
	/**
	 * @var FSBL.Clients.Logger
	 */
	readonly loggerClient: ILogger;
	private routerWrapper: RouterWrapper;
	private subscriptions: {
		id: string;
		channel: string;
	}[] = [];

	/**
	 * Constructor
	 * Params are options but need to be set if intending to use in a services
	 *
	 * @param routerClient Needs to be set if using in a service. Defaults to FSBL.Client.RouterClient if none is provided
	 * @param loggerClient Needs to be set if using in a service. Defaults to FSBL.Client.Logger if none is provided
	 */
	constructor(routerClient?: IRouterClient, loggerClient?: ILogger) {
		if (routerClient || loggerClient) {
			this.routerWrapper = new RouterWrapper(routerClient, loggerClient);
			this.loggerClient = loggerClient ? loggerClient : null;
		} else {
			this.routerWrapper = new RouterWrapper();
		}

		if (!this.loggerClient) {
			this.loggerClient = typeof FSBL !== "undefined" ? FSBL.Clients.Logger : Logger;
		}

		if (window && window.addEventListener) {
			window.addEventListener("unload", () => {
				this.unsubscribeAll();
			});
		}
	}

	/**
	 * Used by UI components that need to display a list of historical notifications.
	 *
	 * @param {string} since ISO8601 formatted date string to fetch notifications from.
	 * @param {IFilter} filter to match to notifications.
	 * @returns {INotification[]} array of notifications.
	 * @throws Error throws an error on par with the Promise standard, containing detail why the request did not complete
	 */
	fetchHistory(since: string, filter?: IFilter): Promise<INotification[]> {
		this.loggerClient.info("FetchHistory() called with params: ", since, filter);
		return new Promise<INotification[]>(async (resolve, reject) => {
			try {
				const data = await this.routerWrapper.query(ROUTER_ENDPOINTS.FETCH_HISTORY, {
					since: since,
					filter: filter
				});
				resolve(data);
			} catch (e) {
				reject(e);
			}
		});
	}

	/**
	 * Return an ISO8601 date a notification matching the specified source was issued.
	 * If no source is provided it will get the latest issue date for all notifications
	 * (I.e the last time any notification was issue to the service)
	 *
	 * @param {string} source to identify which notification to save lastUpdated time for.
	 * @returns last issued at date string in the ISO8601 date format.
	 * @throws Error throws an error on par with the Promise standard, containing detail why the request did not complete
	 */
	getLastIssuedAt(source?: string): Promise<string> {
		this.loggerClient.info("getLastIssued called with params: ", source);
		return new Promise<string>(async (resolve, reject) => {
			try {
				const data = await this.routerWrapper.query(ROUTER_ENDPOINTS.LAST_ISSUED, source);
				resolve(data);
			} catch (e) {
				reject(e);
			}
		});
	}

	/**
	 * Tells the service to perform the action on the notification(s)
	 *
	 * @param {INotification[]|INotification} notifications Notifications to apply action to.
	 * @param {IAction} action which has been triggered by user.
	 * @throws Error Error If no error is thrown, the service has received the request to perform the action successfully. Note a successful resolution of the promise does not mean successful completion of the action.
	 */
	performAction(notifications: INotification[] | INotification, action: IAction): Promise<void> {
		this.loggerClient.info("performAction() called with params: ", notifications, action);
		// I think this is a clumsy interface. The default case will likely be a single notification.
		// No need to punish the developer
		if (!Array.isArray(notifications)) {
			notifications = [notifications];
		}

		return new Promise<void>(async (resolve, reject) => {
			try {
				const data = await this.routerWrapper.query(ROUTER_ENDPOINTS.PERFORM_ACTION, {
					notifications: notifications,
					action: action
				});
				resolve(data);
			} catch (e) {
				reject(e);
			}
		});
	}

	/**
	 * Creates or updates notifications in Finsemble.
	 *
	 * @param {INotification[]} notifications Array of INotification
	 * @throws Error If no error is thrown the service has received the notifications successfully
	 */
	notify(notifications: INotification[]): Promise<void> {
		this.loggerClient.info("notify() called with params: ", notifications);
		return new Promise<void>((resolve, reject) => {
			try {
				this.routerWrapper.query(ROUTER_ENDPOINTS.NOTIFY, notifications).then(() => {
					resolve();
				});
			} catch (e) {
				reject(e);
			}
		});
	}

	/**
	 * Subscribe to a notification stream given a set of name/value pair filters. Returns subscriptionId
	 *
	 * @param {ISubscription} subscription with name value pair used to match on.
	 * @param {OnSubscriptionSuccessCallback} onSubscriptionSuccess called when subscription is successfully created.
	 * @param {OnSubscriptionFaultCallback} onSubscriptionFault if there is an error creating the subscription.
	 * @throws Error throws an error on par with the Promise standard, containing detail why the request did not complete
	 */
	subscribe(
		subscription: ISubscription,
		onSubscriptionSuccess?: OnSubscriptionSuccessCallback,
		onSubscriptionFault?: OnSubscriptionFaultCallback
	): Promise<string> {
		this.loggerClient.info(
			"subscribe() called with params: ",
			subscription,
			onSubscriptionSuccess,
			onSubscriptionFault
		);
		return new Promise<string>(async (resolve, reject) => {
			try {
				// Get a channel from the service to monitor
				const returnValue = await this.routerWrapper.query(
					ROUTER_ENDPOINTS.SUBSCRIBE,
					JSON.parse(JSON.stringify(subscription)) // ISubscription has a callback that can't be sent across the router
				);

				// Monitor the channel and execute subscription.onNotification() for each one that arrives.
				this.loggerClient.info("Got a return value containing a channel", returnValue);
				await this.monitorChannel(returnValue.channel, subscription.onNotification);
				if (onSubscriptionSuccess) {
					onSubscriptionSuccess(returnValue);
				}

				this.subscriptions.push(returnValue);
				resolve(returnValue);
			} catch (e) {
				if (onSubscriptionFault) {
					onSubscriptionFault(e);
				}
				reject(e);
			}
		});
	}

	/**
	 * Used to unsubscribe to a notification stream.
	 * @param {string} subscriptionId which was returned when subscription was created.
	 * @throws Error throws an error on par with the Promise standard, containing detail why the request did not complete
	 */
	unsubscribe(subscriptionId: string): Promise<void> {
		this.loggerClient.info("unsubscribe() called with params: ", subscriptionId);
		return new Promise<void>(async (resolve, reject) => {
			try {
				await this.routerWrapper.query(ROUTER_ENDPOINTS.UNSUBSCRIBE, subscriptionId);
				this.cleanupSubscription(subscriptionId);
				resolve();
			} catch (e) {
				reject(e);
			}
		});
	}

	/**
	 * Unsubscribe from all subscriptions registered with this instance of INotificationClient
	 */
	public unsubscribeAll(): void {
		this.loggerClient.info("unsubscribeAll() called");
		this.subscriptions.forEach(subscription => {
			this.routerWrapper.query(ROUTER_ENDPOINTS.UNSUBSCRIBE, subscription.id);
			this.routerWrapper.removeResponder(subscription.id);
		});

		this.subscriptions = [];
	}

	private cleanupSubscription(subscriptionId: string): void {
		const index = this.subscriptions.findIndex((element: { id: string }) => {
			return element.id === subscriptionId;
		});

		if (index > -1) {
			this.routerWrapper.removeResponder(this.subscriptions[index].channel);
			this.subscriptions.splice(index, 1);
		}
	}

	/**
	 * Listens on a channel to execute the onNotification callback and sends receipt
	 *
	 * @param channel the channel to listen to.
	 * @param onNotification the action to take when a notification comes though
	 */
	private monitorChannel(channel: string, onNotification: OnNotificationCallback): Promise<void> {
		return new Promise(resolve => {
			this.loggerClient.info("Listening for messages on channel", channel);
			this.routerWrapper.addResponder(channel, queryMessage => {
				this.loggerClient.info("Notification received: ", queryMessage.id);

				// Catching user-code errors to allow for successful sending of receipt.
				try {
					onNotification(queryMessage);
				} catch (e) {
					// Error thrown in the onNotification
					this.loggerClient.error(`Error thrown in the subscription.onNotification()`, e);
				}

				// Return value used in addResponder as notification received response.
				return { message: "success" };
			});
			resolve();
		});
	}
}

export { ActionTypes, NotificationClient, ROUTER_NAMESPACE };
