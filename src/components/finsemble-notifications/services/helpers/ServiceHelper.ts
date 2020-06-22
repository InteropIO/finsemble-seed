import INotification from "../../types/Notification-definitions/INotification";
import Action from "../../types/Notification-definitions/Action";
import { ActionTypes } from "../../types/Notification-definitions/ActionTypes";
import IFilter from "../../types/Notification-definitions/IFilter";
import { Map as ImmutableMap, mergeDeepWith } from "immutable";
import IAction from "../../types/Notification-definitions/IAction";
import PerformedAction from "../../types/Notification-definitions/PerformedAction";
import IPerformedAction from "../../types/Notification-definitions/IPerformedAction";
import { PurgeConfig } from "../../types/Notification-definitions/NotificationConfig";

// eslint-disable-next-line
const searchJS = require("searchjs");

const DEFAULT_TYPE_NAME = "default";

const KEY_NAME_DEFAULT_FIELDS = "defaults";
const KEY_NAME_DISMISS_BUTTON_TEXT = "defaultDismissButtonText";
const KEY_NAME_SHOW_DISMISS_ACTION = "showDismissAction";

const DISMISS_BUTTON_TEXT_FALLBACK = "Dismiss";

export default class ServiceHelper {
	/**
	 * Isolates the notification types from a specific part of the config tree
	 * @param config
	 */
	public static normaliseConfig(config: Record<string, object>): Record<string, object> {
		// TODO: Input validation
		return {
			service: ServiceHelper.getServiceDefaults(config),
			types: ServiceHelper.getTypes(config)
		};
	}

	/**
	 * Gets the types from the config
	 *
	 * @param config
	 */
	public static getTypes(config: Record<string, object>): Record<string, object> {
		return Object.assign({}, config && config.hasOwnProperty("types") ? config["types"] : null);
	}

	/**
	 * Sets defaults for any missing config
	 *
	 * @param config
	 */
	public static getServiceDefaults(config: Record<string, object>): Record<string, object> {
		const defaultValues: PurgeConfig = {
			maxNotificationsToRetain: 1000,
			maxNotificationRetentionPeriodSeconds: false
		};
		const defaults = Object.assign(defaultValues, config);
		if (defaults.hasOwnProperty("types")) {
			delete defaults["types"];
		}

		if (defaults.hasOwnProperty("presentationComponents")) {
			delete defaults["presentationComponents"];
		}

		return defaults;
	}

	/**
	 * Applies the defaults defined in the config object to a notification base on the INotification.type
	 *
	 * @param config {Object}
	 * @param notification {INotification}
	 */
	public static applyDefaults(config: any, notification: INotification): INotification {
		let configToApply;

		if (config && config["types"] && config["types"][notification.type]) {
			configToApply = config["types"][notification.type];
		} else if (config && config["types"] && config["types"][DEFAULT_TYPE_NAME]) {
			configToApply = config["types"][DEFAULT_TYPE_NAME];
		}

		if (!Array.isArray(notification.actions)) {
			notification.actions = [];
		}

		if (!Array.isArray(notification.actionsHistory)) {
			notification.actionsHistory = [];
		}

		if (!Array.isArray(notification.stateHistory)) {
			notification.stateHistory = [];
		}

		// A config has not been supplied at all
		if (configToApply) {
			let returnValue = notification;

			if (configToApply.hasOwnProperty(KEY_NAME_DEFAULT_FIELDS)) {
				// @ts-ignore
				let map = ImmutableMap(notification);
				map = mergeDeepWith(ServiceHelper.merge, map, configToApply[KEY_NAME_DEFAULT_FIELDS]);
				returnValue = (map.toObject() as unknown) as INotification;
			}

			const showDismissAction = configToApply.hasOwnProperty(KEY_NAME_SHOW_DISMISS_ACTION)
				? configToApply[KEY_NAME_SHOW_DISMISS_ACTION]
				: false;

			if (showDismissAction) {
				let dismissText = DISMISS_BUTTON_TEXT_FALLBACK;

				if (configToApply.hasOwnProperty(KEY_NAME_DISMISS_BUTTON_TEXT)) {
					dismissText = configToApply[KEY_NAME_DISMISS_BUTTON_TEXT];
				} else if (config.hasOwnProperty("service") && config.service.hasOwnProperty(KEY_NAME_DISMISS_BUTTON_TEXT)) {
					dismissText = config.service[KEY_NAME_DISMISS_BUTTON_TEXT];
				}
				returnValue = ServiceHelper.addDismissActionToNotification(returnValue, dismissText);
			}

			return returnValue;
		} else {
			return notification;
		}
	}

	/**
	 * Adds a dismiss action to a notification if one does not already exist
	 * @param notification
	 * @param buttonText
	 */
	public static addDismissActionToNotification(notification: INotification, buttonText: string): INotification {
		if (!ServiceHelper.hasDismissAction(notification)) {
			const action = new Action();
			action.type = ActionTypes.DISMISS;
			action.buttonText = buttonText;
			notification.actions.push(action);
		}

		return notification;
	}

	public static hasDismissAction(notification: INotification) {
		let returnValue = false;
		notification.actions.forEach(action => {
			if (action.type.toLowerCase() === "dismiss") {
				returnValue = true;
			}
		});

		return returnValue;
	}

	public static merge(oldVal: {}, newVal: {}): {} {
		if (oldVal) {
			if (typeof oldVal === "object") {
				return mergeDeepWith(ServiceHelper.merge, ImmutableMap(oldVal), newVal).toObject();
			} else {
				return oldVal;
			}
		} else {
			return newVal;
		}
	}

	public static filterMatches(filter: IFilter, notification: INotification): boolean {
		// All notifications match if the filters are empty

		const includeExists: boolean = filter && filter.include && filter.include.length > 0;
		const excludeExists: boolean = filter && filter.exclude && filter.exclude.length > 0;

		if (!includeExists && !excludeExists) {
			// Empty filters will match everything
			return true;
		}

		let isMatch = !includeExists;

		if (includeExists) {
			filter.include.forEach(filterToMatch => {
				if (searchJS.matchObject(notification, filterToMatch)) {
					isMatch = true;
				}
			});
		}

		if (excludeExists) {
			filter.exclude.forEach(filterToMatch => {
				if (searchJS.matchObject(notification, filterToMatch)) {
					isMatch = false;
				}
			});
		}

		return isMatch;
	}

	/**
	 * Converts an IAction into and IPerformedAction and places it the actionsHistory
	 *
	 * @param notification {INotification}
	 * @param action {IAction}
	 * @return INotification
	 *
	 * @note JavaScript is pass by reference for objects but prefer to be specific by returning a value
	 * not sure if putting a return in is confusing and hinting at it being pass by reference.
	 */
	public static addPerformedAction(
		notification: INotification,
		action: IAction
	): INotification | ImmutableMap<unknown, unknown> {
		let map;
		if (ImmutableMap.isMap(notification)) {
			map = notification;
		} else {
			// @ts-ignore
			map = ImmutableMap(notification);
		}

		const performedAction = new PerformedAction();
		performedAction.id = action.id;
		performedAction.type = action.type;
		performedAction.datePerformed = new Date().toISOString();

		const actionsHistory: IPerformedAction[] = (map.get("actionsHistory") as IPerformedAction[]).slice(0);
		actionsHistory.push(performedAction);
		map = map.set("actionsHistory", actionsHistory);

		return !ImmutableMap.isMap(notification) ? ((map.toObject() as unknown) as INotification) : map;
	}

	/**
	 * Applies the history states to a notification which if finds in a lists
	 *
	 * @param notification
	 * @param notificationList
	 * @param defaultPrevious
	 */
	public static setNotificationHistory(
		notification: INotification,
		notificationList: Map<string, INotification>,
		defaultPrevious: INotification
	): INotification {
		// @ts-ignore
		const map = ImmutableMap(notification);

		let currentlyStoredNotification: INotification;

		let currentHistory: INotification[];

		if (notificationList.has(notification.id)) {
			currentlyStoredNotification = notificationList.get(notification.id);
			currentHistory = currentlyStoredNotification.stateHistory;
			currentlyStoredNotification.stateHistory = [];
		} else {
			currentHistory = map.get("stateHistory") as INotification[];
			currentlyStoredNotification = defaultPrevious;
			currentlyStoredNotification.stateHistory = [];
		}

		currentHistory.push(currentlyStoredNotification);

		return (map.set("stateHistory", currentHistory).toObject() as unknown) as INotification;
	}

	/**
	 * Get a list of notifications that qualify the for the  purge from storage requirements
	 *
	 * @param notifications
	 * @param purgeConfig
	 */
	public static getItemsToPurge(notifications: Map<string, INotification>, purgeConfig: PurgeConfig): INotification[] {
		const items: INotification[] = [];

		// If it's not set we have all collected all the old ones already
		let gotAllExpired = purgeConfig.maxNotificationRetentionPeriodSeconds === false;
		let count = 0;
		const iterable = notifications.entries();

		do {
			const next = iterable.next();
			if (next.done) {
				break;
			}
			if (purgeConfig.maxNotificationRetentionPeriodSeconds) {
				const actionsHistory = next.value[1].actionsHistory;
				if (actionsHistory && actionsHistory.length) {
					const lastUpdatedDate = Date.parse(actionsHistory[actionsHistory.length - 1].datePerformed);

					if (Date.now() - purgeConfig.maxNotificationRetentionPeriodSeconds * 1000 > lastUpdatedDate) {
						count++;
						items.push(next.value[1]);
						continue;
					} else {
						/**
						 * Notifications are stored is oldest first in the data structure
						 * if the statement does not match we can stop all checks
						 */
						gotAllExpired = true;
					}
				}
			}

			if (notifications.size - count > purgeConfig.maxNotificationsToRetain) {
				count++;
				items.push(next.value[1]);
			}
		} while (!gotAllExpired || notifications.size - count > purgeConfig.maxNotificationsToRetain);

		return items;
	}
}
