import INotificationService from "../../types/Notification-definitions/INotificationService";
import INotification from "../../types/Notification-definitions/INotification";
import IAction from "../../types/Notification-definitions/IAction";
import ISubscription from "../../types/Notification-definitions/ISubscription";
import RouterWrapper, { ROUTER_ENDPOINTS } from "../helpers/RouterWrapper";
import { ActionTypes } from "../../types/Notification-definitions/ActionTypes";
import ILastIssued from "../../types/Notification-definitions/ILastIssued";
import ISnoozeTimer from "../../types/Notification-definitions/ISnoozeTimer";
import SnoozeTimer from "../../types/Notification-definitions/SnoozeTimer";
import LastIssued from "../../types/Notification-definitions/LastIssued";
import Action from "../../types/Notification-definitions/Action";
import ServiceHelper from "../helpers/ServiceHelper";
import IFilter from "../../types/Notification-definitions/IFilter";
// @ts-ignore
import { v4 as uuidV4 } from "uuid";
import { Map as ImmutableMap } from "immutable";
import { CallbackError, StandardCallback } from "../../types/FSBL-definitions/globals";

// TODO: Add Ticket to allow importing Finsemble
// eslint-disable-next-line
const Finsemble = require("@chartiq/finsemble");

Finsemble.Clients.Logger.start();
Finsemble.Clients.Logger.log("notification Service starting up");

const NO_SOURCE = "NO_SOURCE_DEFINED";

/**
 * A service used to transport notification data across the system
 */
export default class NotificationService extends Finsemble.baseService implements INotificationService {
	/**
	 * Abstracting all internal state into a single point as a way to keep track of what
	 * needs to change when implementing a solution for storage
	 * TODO: Implement storage - will need to modify all places storageAbstraction is referenced
	 */
	private storageAbstraction: {
		subscriptions: Map<string, ISubscription>;
		snoozeTimers: Map<string, ISnoozeTimer>;

		/**
		 * TODO: Think about the best representation of notification as oldest ones will need to drop off the list
		 * Theoretically Map should work https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
		 * as it remembers the original insertion order of the keys. Need to test if the order is preserved when
		 * retrieving it from storage.
		 */
		notifications: Map<string, INotification>;
		lastIssued: Map<string, ILastIssued>;
	};

	private proxyToWebApiFilter: IFilter | false;
	private routerWrapper: RouterWrapper;

	private config: any = {
		service: {},
		types: {}
	};

	/**
	 * Initializes a new instance of the NotificationService class.
	 */
	constructor() {
		super({
			// Declare any service or client dependencies that must be available before your service starts up.
			startupDependencies: {
				// If the service is using another service directly via an event listener or a responder, that service
				// should be listed as a service start up dependency.
				services: [],
				// When ever you use a client API with in the service, it should be listed as a client startup
				// dependency. Any clients listed as a dependency must be initialized at the top of this file for your
				// service to startup.
				clients: []
			}
		});

		this.proxyToWebApiFilter = false;
		this.storageAbstraction = {
			subscriptions: new Map<string, ISubscription>(),
			snoozeTimers: new Map<string, ISnoozeTimer>(),
			notifications: new Map<string, INotification>(),
			lastIssued: new Map<string, ILastIssued>()
		};

		this.subscribe = this.subscribe.bind(this);
		this.notify = this.notify.bind(this);
		this.broadcastNotification = this.broadcastNotification.bind(this);
		this.getLastIssued = this.getLastIssued.bind(this);
		this.readyHandler = this.readyHandler.bind(this);
		this.performAction = this.performAction.bind(this);
		this.fetchHistory = this.fetchHistory.bind(this);
		this.unsubscribe = this.unsubscribe.bind(this);
		this.applyConfigChange = this.applyConfigChange.bind(this);
		this.onBaseServiceReady(this.readyHandler);
	}

	/**
	 *
	 * @param {Function} callback
	 */
	readyHandler(callback: Function) {
		this.routerWrapper = new RouterWrapper(Finsemble.Clients.RouterClient, Finsemble.Clients.Logger);
		this.createRouterEndpoints();
		Finsemble.Clients.Logger.log("notification Service ready");
		Finsemble.Clients.ConfigClient.addListener(
			{ field: "finsemble.servicesConfig.notifications" },
			this.applyConfigChange
		);
		Finsemble.Clients.ConfigClient.getValue(
			{ field: "finsemble.servicesConfig.notifications" },
			this.applyConfigChange
		).then();
		callback();
	}

	/**
	 * Setting up the router channels/endpoints
	 */
	createRouterEndpoints() {
		this.setupNotify();
		this.setupLastIssued();
		this.setupSubscribe();
		this.setupAction();
		this.setupFetchHistory();
		this.setupUnsubscribe();
		this.setupUIPubSub();
	}

	/**
	 * When incoming notifications arrive, lookup matching subscriptions and call necessary
	 * callbacks on subscription.
	 *
	 * @param {INotification} notification of INotification objects to broadcast.
	 * @private
	 */
	broadcastNotification(notification: INotification): void {
		Finsemble.Clients.Logger.log("Broadcasting Notification: ", notification.id);
		this.storageAbstraction.subscriptions.forEach(subscription => {
			// Check if this notification matches any filters
			if (ServiceHelper.filterMatches(subscription.filter, notification)) {
				// For each notification that matches, expect a response and send it out.
				this.expectReceipt(subscription, notification);
				this.routerWrapper
					.query(subscription.channel, notification, null, (error, response) => {
						this.setReceivedReceipt(subscription, notification, error, response);
					})
					.then();
			}
		});
		if (
			this.config["service"]["proxyToWebApiFilter"] &&
			ServiceHelper.filterMatches(this.config["service"]["proxyToWebApiFilter"], notification)
		) {
			this.webApiNotify(notification);
		}
	}

	webApiNotify(notification: INotification): void {
		const title = [];
		notification.title ? title.push(notification.title) : null;
		notification.title ? title.push(notification.headerText) : null;

		function convertNotificationToWebApi(notification: INotification) {
			return {
				body: notification.details,
				icon: notification.contentLogo ? notification.contentLogo : notification.headerLogo
			};
		}

		const options = convertNotificationToWebApi(notification);
		// TODO: WebAPI Actions are only possible by implementing ServiceWorkerRegistration.showNotification()
		new Notification(title.join(" - "), options);
	}

	/**
	 * Delete a notification as part of a purge.
	 *
	 * @param {string} id of a notification
	 *
	 * TODO: implement using appropriate storage
	 */
	deleteNotification(id: string): void {
		if (this.storageAbstraction.notifications.has(id)) {
			this.storageAbstraction.notifications.delete(id);
		}
	}

	/**
	 * Handles all messages on the 'action' endpoint/channel and sends them
	 * out to the service that knows how to deal with it.
	 *
	 * @param message
	 */
	performAction(message: any): Record<string, any> {
		Finsemble.Clients.Logger.info("Request to perform Actions", message);
		const { notifications, action } = message;
		const response = {
			message: "success",
			errors: new Array<{}>()
		};

		notifications.forEach((notification: INotification) => {
			try {
				this.delegateAction(notification, action);
			} catch (error) {
				response.message = "fail";
				response.errors.push(error.message);
			}
		});
		return response;
	}

	/**
	 * Creates or updates notifications in Finsemble.
	 *
	 * @param {INotification[]} notifications from external source to be created or updated in Finsemble.
	 */
	notify(notifications: INotification[]): void {
		notifications.forEach(notification => {
			let processedNotification = this.receiveNotification(notification);
			this.saveLastIssuedAt(processedNotification.source, processedNotification.issuedAt);
			processedNotification = ServiceHelper.setNotificationHistory(
				processedNotification,
				this.storageAbstraction.notifications,
				notification
			);
			this.storeNotifications(processedNotification);
			this.broadcastNotification(processedNotification);
		});
	}

	/**
	 * Picks up any messages on the 'subscribe' endpoint/channel
	 *
	 * @param {ISubscription} subscription
	 * @return {string} a router channel on which notifications for this subscription will be sent.
	 */
	subscribe(subscription: ISubscription): {} {
		const channel = this.getChannel();
		subscription.id = this.getUuid();
		Finsemble.Clients.Logger.info("Successfully processed subscription: ", subscription);
		subscription.channel = channel;

		this.addToSubscription(subscription);
		return {
			id: subscription.id,
			channel: channel
		};
	}

	/**
	 * Stores the time when a notification arrived from a specific source in finsemble.
	 *
	 * @param {string} source a notification that was updated. This notification can then be matched on using a filter to find out when different notifications were last updated.
	 * @param {string} issuedAt ISO8601 format string. When a notification was last delivered to Finsemble.
	 */
	saveLastIssuedAt(source: string, issuedAt: string): void {
		if (!source) {
			source = NO_SOURCE;
		}

		if (this.storageAbstraction.lastIssued.has(source)) {
			const d1 = new Date(issuedAt);
			const d2 = new Date(this.storageAbstraction.lastIssued.get(source).issuedAt);
			// Update only if the new date is newer
			if (d1 > d2) {
				this.storageAbstraction.lastIssued.set(source, new LastIssued(source, issuedAt));
			}
		} else {
			this.storageAbstraction.lastIssued.set(source, new LastIssued(source, issuedAt));
		}
	}

	/**
	 * Get a channel/endpoint the client will need to listen to
	 *
	 * @return string
	 */
	getChannel(): string {
		return ROUTER_ENDPOINTS.SUBSCRIBE + `.${this.getUuid()}`;
	}

	/**
	 * Snoozes a notification
	 *
	 * @param notification {INotification}
	 * @param action {IAction}
	 *
	 * TODO: notification wake on finsemble restart
	 */
	snooze(notification: INotification, action: IAction): INotification {
		const defaultTimeout = 10000; // TODO: get from config
		const timeout = action.milliseconds ? action.milliseconds : defaultTimeout;

		const snoozeTimer = new SnoozeTimer();
		snoozeTimer.notificationId = notification.id;
		snoozeTimer.snoozeInterval = timeout;
		snoozeTimer.timeoutId = setTimeout(() => {
			const action = new Action();
			action.id = this.getUuid();
			action.type = "FINSEMBLE:WAKE";
			notification = ServiceHelper.addPerformedAction(notification, action);
			notification.isSnoozed = false;
			this.notify([notification]);
		}, timeout);
		this.storageAbstraction.snoozeTimers.set(notification.id, snoozeTimer);
		notification.isSnoozed = true;
		return notification;
	}

	dismiss(notification: INotification): INotification {
		notification.isRead = true;
		return notification;
	}

	spawn(notification: INotification, action: IAction): INotification {
		notification.isRead = true;
		Finsemble.Clients.LauncherClient.spawn(action.component, action.spawnParams).then();
		return notification;
	}

	validateForwardParams(action: IAction) {
		if (!action.channel) {
			throw new Error(`No channel set when trying to perform '${action.type}'`);
		}
	}

	public unsubscribe(subscriptionId: string) {
		Finsemble.Clients.Logger.log(`Removing notification subscription: ${subscriptionId}`);
		if (this.storageAbstraction.subscriptions.has(subscriptionId)) {
			this.storageAbstraction.subscriptions.delete(subscriptionId);
		}
		return;
	}

	applyConfigChange: StandardCallback = (err, config) => {
		if (err) {
			Finsemble.Clients.Logger.error(`Unable to get config err: ${err}`);
		}
		this.config = ServiceHelper.normaliseConfig(config);
	};

	/**
	 * Delegate the action to any service that is registered on the correct channel
	 *
	 * @see notificationsBuiltInActionsService for an example
	 *
	 * @param notification
	 * @param action
	 *
	 */
	private delegateAction(notification: INotification, action: IAction): void {
		/**
		 * Action is considered completed by the time it hits the service
		 * ie. (the request for action has been received)
		 * Discussion here https://chartiq.slack.com/archives/CPYQ16K7H/p1574357206003200
		 */
		notification = ServiceHelper.addPerformedAction(notification, action);

		/**
		 * If an action is performed on a notification, it should not be snoozed anymore.
		 */
		this.removeFromSnoozeQueue(notification);

		Finsemble.Clients.Logger.info(`Action type: ${action.type}`);
		// Pick up any updated states from performing the action
		switch (action.type.toUpperCase()) {
			case ActionTypes.SNOOZE:
				notification = this.snooze(notification, action);
				break;
			case ActionTypes.SPAWN:
				notification = this.spawn(notification, action);
				break;
			case ActionTypes.QUERY:
				notification = this.forwardAsQuery(notification, action);
				break;
			case ActionTypes.TRANSMIT:
				notification = this.forwardAsTransmit(notification, action);
				break;
			case ActionTypes.PUBLISH:
				notification = this.forwardAsPublish(notification, action);
				break;
			case ActionTypes.DISMISS:
				notification = this.dismiss(notification);
				break;
			default:
				Finsemble.Clients.Logger.error(`Unable to perform action '${action.type}' on notification`);
				return;
		}
		Finsemble.Clients.Logger.info("Updated notification state", notification);

		// Send out the new state to all required clients
		this.notify([notification]);
	}

	/**
	 * TODO: Move this function into the Helper and add testing
	 * @param notification
	 */
	private receiveNotification(notification: INotification): INotification {
		Finsemble.Clients.Logger.info("Received state", notification);
		notification = ServiceHelper.applyDefaults(this.config, notification);

		// @ts-ignore
		let map = ImmutableMap(notification);

		if (!map.get("id")) {
			map = map.set("id", this.getUuid());
		}

		if (!map.get("issuedAt")) {
			map = map.set("issuedAt", new Date().toISOString());
		}

		if (!map.get("receivedAt")) {
			const action = new Action();
			action.id = this.getUuid();
			action.type = "FINSEMBLE:RECEIVED";
			map = ServiceHelper.addPerformedAction(map, action);
			map = map.set("receivedAt", new Date().toISOString());
		}
		Finsemble.Clients.Logger.info("Applied state", map);
		return map.toObject();
	}

	/**
	 * Stores the notifications
	 *
	 * @param notification {INotification}
	 */
	private storeNotifications(notification: INotification) {
		this.storageAbstraction.notifications.set(notification.id, notification);
	}

	/**
	 * Setup callback on notify channel
	 */
	private setupNotify(): void {
		this.routerWrapper.addResponder(ROUTER_ENDPOINTS.NOTIFY, this.notify);
	}

	/**
	 * Setup callback on notify channel
	 */
	private setupLastIssued(): void {
		this.routerWrapper.addResponder(ROUTER_ENDPOINTS.LAST_ISSUED, this.getLastIssued);
	}

	/**
	 * Setup callback on notify channel
	 */
	private setupFetchHistory(): void {
		this.routerWrapper.addResponder(ROUTER_ENDPOINTS.FETCH_HISTORY, this.fetchHistory);
	}

	/**
	 * Setup callback on subscribe channel
	 */
	private setupSubscribe() {
		this.routerWrapper.addResponder(ROUTER_ENDPOINTS.SUBSCRIBE, this.subscribe);
	}

	/**
	 * Setup callback on unsubscribe channel
	 */
	private setupUnsubscribe() {
		this.routerWrapper.addResponder(ROUTER_ENDPOINTS.UNSUBSCRIBE, this.unsubscribe);
	}

	/**
	 * Setup callback on action channel
	 */
	private setupAction() {
		this.routerWrapper.addResponder(ROUTER_ENDPOINTS.PERFORM_ACTION, this.performAction);
	}

	/**
	 * Setup UI PubSub Channel
	 */
	private setupUIPubSub() {
		Finsemble.Clients.RouterClient.addPubSubResponder("notification-ui", {});
	}

	/* eslint-disable */
	/**
	 * Sets up that we are expecting a receipt for the subscription and notification.
	 *
	 * @param subscription
	 * @param notification
	 *
	 * TODO: Implement.
	 * TODO: Also implement the mechanism that watches for and retries missing receipts
	 */
	private expectReceipt(subscription: ISubscription, notification: INotification) {
		// We're expecting a received receipt on the channel from the client
	}

	/* eslint-enable */

	/**
	 * Set the receipt status
	 *
	 * @param subscription
	 * @param notification
	 * @param error The error from the Router query
	 * @param response
	 *
	 * TODO: Implement.
	 * @Note I just put all the params in here... not sure what info will be needed
	 */
	private setReceivedReceipt(
		subscription: ISubscription,
		notification: INotification,
		error: CallbackError | Error | string | null,
		response: any
	) {
		Finsemble.Clients.Logger.info(`Got a receipt on: ${subscription.channel}`);
		// We've received a response from the client. Process it and set the correct value
	}

	/**
	 * Store the subscription so it can be referenced and also unsubscribed from later.
	 *
	 * @param subscription
	 */
	private addToSubscription(subscription: ISubscription) {
		this.storageAbstraction.subscriptions.set(subscription.id, subscription);
	}

	private forwardAsQuery(notification: INotification, action: IAction): INotification {
		this.validateForwardParams(action);
		try {
			notification.isRead = true;
			this.routerWrapper
				.query(
					action.channel,
					{
						notification: notification,
						actionPayload: action.payload
					},
					""
				)
				.then();
		} catch (error) {
			Finsemble.Clients.Logger.error(`Error performing action on channel channel: '${action.channel}'`);
			notification.isRead = false;
		}

		return notification;
	}

	private forwardAsTransmit(notification: INotification, action: IAction): INotification {
		this.validateForwardParams(action);
		this.routerWrapper.transmit(
			action.channel,
			{
				notification: notification,
				actionPayload: action.payload
			},
			""
		);

		notification.isRead = true;
		return notification;
	}

	private forwardAsPublish(notification: INotification, action: IAction): INotification {
		this.validateForwardParams(action);
		this.routerWrapper.publish(
			action.channel,
			{
				notification: notification,
				actionPayload: action.payload
			},
			""
		);

		notification.isRead = true;
		return notification;
	}

	/**
	 * Gets the last issued date for the source provided
	 *
	 * If no source is provided it will get the latest issue date for all notifications
	 * (I.e the last time any notification was issue to the service)
	 *
	 * @param source
	 */
	private getLastIssued(source?: string): string {
		Finsemble.Clients.Logger.info(`Finding last issued for source: '${source}'`);
		let returnValue = "";
		if (source && this.storageAbstraction.lastIssued.has(source)) {
			returnValue = this.storageAbstraction.lastIssued.get(source).issuedAt;
		} else {
			this.storageAbstraction.lastIssued.forEach((lastIssued: ILastIssued) => {
				if (!returnValue) {
					returnValue = lastIssued.issuedAt;
				} else {
					const d1 = new Date(returnValue);
					const d2 = new Date(lastIssued.issuedAt);
					if (d2 > d1) {
						returnValue = lastIssued.issuedAt;
					}
				}
			});
		}

		return returnValue;
	}

	/**
	 * Executes the fetch instruction to return notifications stored by the service
	 *
	 * If source is not provided it will get the latest issue from the all registered sources
	 *
	 * @param message
	 */
	private fetchHistory(message: any): INotification[] {
		Finsemble.Clients.Logger.info("Fetch history request with params", message);
		let { since } = message;
		const { filter } = message;

		const notifications: INotification[] = [];

		if (since) {
			Finsemble.Clients.Logger.info("Since date", since);
			since = new Date(since);
		}

		this.storageAbstraction.notifications.forEach(notification => {
			if (since) {
				// If there is a date and the notification was received before the date - skip it
				Finsemble.Clients.Logger.info("Notification date", notification.receivedAt);
				const notificationDate = new Date(notification.receivedAt);
				if (notificationDate < since) {
					return;
				}
			}

			if (filter && !ServiceHelper.filterMatches(filter, notification)) {
				// If there is a filter and the filter does not match the notification - skip it
				return;
			}

			// Notification date is greater than date param or not date param is set
			// Filter matches or not filter is set
			notifications.push(notification);
		});
		return notifications;
	}

	/**
	 * Generates a UUID
	 */
	private getUuid(): string {
		return uuidV4();
	}

	private removeFromSnoozeQueue(notification: INotification) {
		if (this.storageAbstraction.snoozeTimers.has(notification.id)) {
			clearTimeout(this.storageAbstraction.snoozeTimers.get(notification.id).timeoutId);
		}
	}
}
