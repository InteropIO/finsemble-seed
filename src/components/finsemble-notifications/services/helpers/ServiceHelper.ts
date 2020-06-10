import INotification from "../../types/Notification-definitions/INotification";
import Action from "../../types/Notification-definitions/Action";
import { ActionTypes } from "../../types/Notification-definitions/ActionTypes";
import IFilter from "../../types/Notification-definitions/IFilter";
import { Map as ImmutableMap, mergeDeepWith } from "immutable";
import IAction from "../../types/Notification-definitions/IAction";
import PerformedAction from "../../types/Notification-definitions/PerformedAction";
import IPerformedAction from "../../types/Notification-definitions/IPerformedAction";

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

	public static getTypes(config: Record<string, object>): Record<string, object> {
		return Object.assign({}, config && config.hasOwnProperty("types") ? config["types"] : null);
	}

	public static getServiceDefaults(config: Record<string, object>): Record<string, object> {
		const defaults = Object.assign({}, config);
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
				returnValue = map.toObject();
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
	public static addPerformedAction(notification: INotification, action: IAction): INotification {
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

		const actionsHistory: IPerformedAction[] = map.get("actionsHistory").slice(0);
		actionsHistory.push(performedAction);
		map = map.set("actionsHistory", actionsHistory);

		return ImmutableMap.isMap(notification) ? map : map.toObject();
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
	) {
		// @ts-ignore
		const map = ImmutableMap(notification);

		let currentlyStoredNotification: INotification;

		let currentHistory: INotification[];

		if (notificationList.has(notification.id)) {
			currentlyStoredNotification = notificationList.get(notification.id);
			currentHistory = currentlyStoredNotification.stateHistory;
			currentlyStoredNotification.stateHistory = [];
		} else {
			currentHistory = map.get("stateHistory");
			currentlyStoredNotification = defaultPrevious;
			currentlyStoredNotification.stateHistory = [];
		}

		currentHistory.push(currentlyStoredNotification);

		return map.set("stateHistory", currentHistory).toObject();
	}
}
