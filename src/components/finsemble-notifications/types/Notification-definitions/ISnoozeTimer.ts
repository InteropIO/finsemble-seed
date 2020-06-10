/**
 * @property {number} timeoutId - The timeoutId returned when calling setTimout
 * @property {string} notificationId - The id of the notification being snoozed
 * @property {number} snoozeInterval - How long the is meant to be snooze for.
 */
import Timeout = NodeJS.Timeout;

export default interface ISnoozeTimer {
	timeoutId: Timeout;
	notificationId: string;
	snoozeInterval: number;
}
