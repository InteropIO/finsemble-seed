import ISnoozeTimer from "./ISnoozeTimer";
import Timeout = NodeJS.Timeout;

export default class SnoozeTimer implements ISnoozeTimer {
	timeoutId: Timeout;
	notificationId: string;
	snoozeInterval: number;
}
