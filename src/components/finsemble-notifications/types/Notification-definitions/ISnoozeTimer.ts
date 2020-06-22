/**
 * @property {number} timeoutId - The timeoutId returned when calling setTimout
 * @property {string} notificationId - The id of the notification being snoozed
 * @property {number} snoozeInterval - How long the is meant to be snooze for.
 * @property {number} wakeEpochMilliseconds - The number of milliseconds after epoch that the timer should wake

 */
import Timeout = NodeJS.Timeout;

export default interface ISnoozeTimer {
	timeoutId: Timeout;
	notificationId: string;
	wakeEpochMilliseconds: number;
	snoozeInterval: number;
}
