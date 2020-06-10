import INotification from "./Notification-definitions/INotification";

interface State {
	windowId: string;
	windowPosition: {};
	notifications: Array<INotification>;
}
