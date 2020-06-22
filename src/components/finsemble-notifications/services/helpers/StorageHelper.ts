import INotification from "../../types/Notification-definitions/INotification";
import ILastIssued from "../../types/Notification-definitions/ILastIssued";
import ISnoozeTimer from "../../types/Notification-definitions/ISnoozeTimer";
import { ILogger } from "@chartiq/finsemble/dist/types/clients/ILogger";

const StorageClient = require("@chartiq/finsemble").Clients.StorageClient;

const STORAGE_TOPIC = "finsemble.notifications";
const STORAGE_KEY_LAST_ISSUED = "last.issued";
const STORAGE_KEY_SNOOZE_TIMERS = "snooze.timers";
const STORAGE_KEY_LIST = "list.contents";
export const STORAGE_KEY_NOTIFICATION_PREFIX = "id.";

export default class StorageHelper {
	public static logger: ILogger;
	/**
	 * Persists a notification to storage
	 *
	 * @param notifications
	 * @param notification
	 * @param skipStorage
	 */
	public static async persistNotification(
		notifications: Map<string, INotification>,
		notification: INotification,
		skipStorage = false
	): Promise<void> {
		await StorageHelper.storeListIds(notifications);
		await StorageHelper.storeValue(STORAGE_KEY_NOTIFICATION_PREFIX + notification.id, notification);
	}

	/**
	 * Fetches notifications from storage
	 */
	public static async fetchNotifications(): Promise<Map<string, INotification>> {
		return new Promise<Map<string, INotification>>(async resolve => {
			const returnValue = new Map<string, INotification>();
			const keys = await StorageHelper.getValue(STORAGE_KEY_LIST);

			const promises: Promise<INotification>[] = [];

			if (keys) {
				keys.forEach((key: string) => {
					promises.push(StorageHelper.getNotification(key));
				});
			}

			const notifications = await Promise.all(promises);
			notifications.forEach((notification, index) => {
				if (notification) {
					returnValue.set(notification.id, notification);
				} else {
					StorageHelper.logger.error(`Notification ${keys[index]} not found`);
				}
			});

			resolve(returnValue);
		});
	}

	/**
	 * Persists the lastIssued data to storage
	 *
	 * @param lastIssued
	 */
	public static storeLastIssued(lastIssued: Map<string, ILastIssued>): Promise<void> {
		return StorageHelper.storeValue(STORAGE_KEY_LAST_ISSUED, lastIssued);
	}

	/**
	 * Fetches the lastIssued data from storage
	 */
	public static async fetchLastIssued(): Promise<Map<string, ILastIssued>> {
		return new Promise<Map<string, ILastIssued>>(async resolve => {
			let lastIssued = await StorageHelper.getValue(STORAGE_KEY_LAST_ISSUED);
			if (!lastIssued) {
				lastIssued = new Map<string, ILastIssued>();
			}
			resolve(lastIssued);
		});
	}

	/**
	 * Persists the snooze timers to storage
	 *
	 * @param snoozeTimers
	 */
	public static storeSnoozeTimers(snoozeTimers: Map<string, ISnoozeTimer>): Promise<void> {
		return StorageHelper.storeValue(STORAGE_KEY_SNOOZE_TIMERS, snoozeTimers);
	}

	/**
	 * Fetches the snooze timers from storage
	 */
	public static async fetchSnoozeTimers(): Promise<Map<string, ISnoozeTimer>> {
		return new Promise<Map<string, ISnoozeTimer>>(async resolve => {
			let snoozeTimers = await StorageHelper.getValue(STORAGE_KEY_SNOOZE_TIMERS);
			if (!snoozeTimers) {
				snoozeTimers = new Map<string, ISnoozeTimer>();
			}
			resolve(snoozeTimers);
		});
	}

	/**
	 * Persists the list of Notifications Ids to storage
	 * @param notifications
	 */
	private static async storeListIds(notifications: Map<string, INotification>): Promise<void> {
		const keys = [...notifications.keys()];
		await StorageClient.save({ topic: STORAGE_TOPIC, key: STORAGE_KEY_LIST, value: keys });
	}

	/**
	 * Fetches a single notification from storage
	 *
	 * @param key
	 */
	private static async getNotification(key: string): Promise<INotification> {
		return await StorageHelper.getValue(STORAGE_KEY_NOTIFICATION_PREFIX + key);
	}

	/**
	 * Deletes from the store
	 * @param key
	 */
	public static async deleteValue(key: string): Promise<void> {
		await StorageClient.remove({ topic: STORAGE_TOPIC, key: key });
	}

	/**
	 * Persists to the store
	 * @param key
	 * @param value
	 */
	private static async storeValue(key: string, value: Record<string, any>): Promise<void> {
		await StorageClient.save({ topic: STORAGE_TOPIC, key: key, value: value });
	}

	/**
	 * Gets a value from the store
	 * @param key
	 */
	private static async getValue(key: string) {
		return await StorageClient.get({ topic: STORAGE_TOPIC, key: key });
	}
}
