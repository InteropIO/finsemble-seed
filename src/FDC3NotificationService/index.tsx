import {
	AppIdentifier, Channel,
	ChannelError,
	Context,
	IntentHandler,
	StandardErrorCallback
} from "@finsemble/finsemble-core";
import {
	IAction,
	IFilter,
	INotification,
	ISubscription
} from "@finsemble/finsemble-core/types/platform/services/notification/types";
import {RouterResponse} from "@finsemble/finsemble-core/types/platform/services/router/types";
import uuidv4 from "uuid-random";

interface FDC3Notification extends Context {
	id?: {
		notificationId?: string;
	};
	title: string;
	options?: {
		body?: string;
		icon?: string;
		image?: string;
		notificationType?: string;
		actions?: FDC3Action[];
		notificationAlertSound?: string;
	};
	metadata?: {
		issuedAt?: FDC3DateTime;
		receivedAt?: FDC3DateTime;
		source?: AppIdentifier;
		timeout?: number;
		isRead?: boolean;
		isMuted?: boolean;
		isSnoozed?: boolean;
		isDeleted?: boolean;
	};
}

type FDC3DateTime = string;

interface FDC3Action extends Context {
	type: "fdc3.action";
	title: string;
	intent?: string;
	context: Context;
	app?: AppIdentifier;
}

type CustomActionResponse<T> = {
	notification: INotification;
	actionPayload: T;
};

interface FDC3NotificationFilter extends Partial<FDC3Notification> {}

const FDC3_CUSTOM_ACTION_CHANNEL: string = "finsemble.fdc3.notification.action";

const main = () => {
	const convertFDC3NotificationToFinsemble = (context: FDC3Notification | FDC3NotificationFilter): INotification => {
		const convertAction = (fdc3Action: FDC3Action): IAction => {
			return {
				markAsRead: false,
				buttonText: fdc3Action.title,
				type: "TRANSMIT",
				channel: FDC3_CUSTOM_ACTION_CHANNEL,
				payload: fdc3Action,
			};
		};

		const notification: INotification = {
			id: context.id?.notificationId ?? (context.type == "fdc3.notification" ? `fdc3-${uuidv4()}` : undefined), // Generate ID here, so we can pick it up from the
			type: context.options?.notificationType,
			title: context.title as string,
			details: context.options?.body,
			headerLogo: context.options?.icon,
			contentLogo: context.options?.image,
			actions: context.options?.actions?.map(convertAction),
			issuedAt: context.metadata?.issuedAt ?? "",
			receivedAt: context.metadata?.receivedAt,
			notificationAlertSound: context.options?.notificationAlertSound,
			source: context.metadata?.source?.instanceId ?? context.metadata?.source?.appId,
			timeout: context.metadata?.timeout,
			isDeleted: context.metadata?.isDeleted ?? false,
			isMuted: context.metadata?.isMuted ?? false,
			isRead: context.metadata?.isRead ?? false,
			isSnoozed: context.metadata?.isSnoozed ?? false,
			stateHistory: [],
		};

		return notification as INotification;
	};

	const convertFDC3FilterToFinsemble = (context: FDC3NotificationFilter): IFilter => {
		const filter: IFilter = {
			include: [],
		};

		/**
		 * Can you raise an intent with an empty filter to get all notifications?
		 * const resolution2 = await fdc3.raiseIntent("GetNotifications") // Not allowed by raiseIntent API
		 * What is an empty filter?
		 * const resolution2 = await fdc3.raiseIntent("GetNotifications", {})
		 * or
		 * const resolution2 = await fdc3.raiseIntent("GetNotifications", { type: "fdc3.notification.filter" })
		 *
		 * What does get all notifications mean? Get all notification sent via FDC3 or notifications also sent
		 * with the FSBL Client? These are likely to not be fully compatible, in that they will likely have actions
		 * that don't have an FDC3 equivalent.
		 *
		 * Is there a formal definition for "fdc3.notification.filter"
		 */
		if (context.type === "fdc3.notification.filter") {
			let notification: Partial<INotification> = convertFDC3NotificationToFinsemble(context);
			delete notification.isDeleted;
			delete notification.isMuted;
			delete notification.isRead;
			delete notification.isSnoozed;
			delete notification.stateHistory;
			if (notification.issuedAt === "") {
				delete notification.issuedAt;
			}

			Object.keys(notification).forEach((key) => {
				if (notification[key] === undefined) {
					delete notification[key];
				}
			});

			if (Object.keys(notification).length) {
				filter.include?.push(notification);
			}
		}

		return filter;
	};

	const convertFinsembleToFDC3 = (notification: INotification, source?: FDC3Notification): FDC3Notification => {
		const convertAction = (fdc3Action: IAction): FDC3Action[] => {
			// Omit any actions from notifications that somehow get in here that are not in the FDC3 format.
			if (fdc3Action.type == "TRANSMIT" && fdc3Action.channel == FDC3_CUSTOM_ACTION_CHANNEL) {
				return [fdc3Action.payload];
			}
			return [];
		};

		return {
			id: { notificationId: notification.id },
			title: notification.title,
			type: "fdc3.notification",
			options: {
				body: notification.details,
				icon: notification.headerLogo,
				image: notification.contentLogo,
				notificationAlertSound: notification.notificationAlertSound,
				notificationType: notification.type,

				actions: notification.actions?.flat().flatMap(convertAction),
			},
			metadata: {
				source: source?.metadata?.source,
				timeout: notification.timeout,
				isDeleted: notification.isDeleted,
				isMuted: notification.isMuted,
				isRead: notification.isRead,
				isSnoozed: notification.isSnoozed,
				issuedAt: notification.issuedAt,
				receivedAt: notification.receivedAt,
			},
		};
	};

	const createNotificationListener = (context: FDC3Notification): Promise<Context> => {
		const { type } = context;
		return new Promise(async (resolve) => {
			if (type === "fdc3.notification") {
				const notification: INotification = convertFDC3NotificationToFinsemble(context);

				/**
				 * Subscribe to the notification returned from the notification service
				 */
				const subscription = await FSBL.Clients.NotificationClient.subscribe(
					{
						filter: { include: [{ id: notification.id as string }] },
					},
					(processedNotification) => {
						FSBL.Clients.NotificationClient.unsubscribe(subscription.id);
						const returnContext = convertFinsembleToFDC3(processedNotification);
						resolve(returnContext);
					}
				);

				FSBL.Clients.NotificationClient.notify(notification);
			}
		});
	};

	const getNotificationsListener = (context: FDC3NotificationFilter): Promise<Channel> =>
		new Promise<Channel>(async (resolve, reject) => {
			let filter: Partial<ISubscription> = {
				filter: convertFDC3FilterToFinsemble(context),
			};

			const channel = await fdc3.createPrivateChannel();
			const subscription = await FSBL.Clients.NotificationClient.subscribe(filter, (notification) => {
				channel.broadcast(convertFinsembleToFDC3(notification));
			});

			channel.onDisconnect(() => {
				// Not getting called when the window closes - can end up with a lot of unnecessary router traffic
				FSBL.Clients.NotificationClient.unsubscribe(subscription.id);
			});
			resolve(channel);
			reject(ChannelError.CreationFailed);
		});

	const registerIntents = () => {
		FSBL.Clients.Logger.log("Adding intent listeners");
		fdc3.addIntentListener("CreateNotification", createNotificationListener as IntentHandler);
		fdc3.addIntentListener("UpdateNotification", createNotificationListener as IntentHandler);
		fdc3.addIntentListener("GetNotifications", getNotificationsListener);
	};

	const performAction: StandardErrorCallback<RouterResponse<CustomActionResponse<FDC3Action>> | null> = (
		err,
		response
	) => {
		if (response?.data.actionPayload.type == "fdc3.action" && response?.data.actionPayload.context) {
			const { actionPayload: action } = response.data;
			if (action.intent) {
				fdc3.raiseIntent(action.intent, action.context, action.app);
			} else {
				fdc3.raiseIntentForContext(action.context);
			}
		}
	};

	const createRouterEndpoints = () => {
		FSBL.Clients.RouterClient.addListener(FDC3_CUSTOM_ACTION_CHANNEL, performAction);
	};

	const initService = () => {
		registerIntents();
		createRouterEndpoints();
		FSBL.publishReady();
	};
	initService();
};
main();
