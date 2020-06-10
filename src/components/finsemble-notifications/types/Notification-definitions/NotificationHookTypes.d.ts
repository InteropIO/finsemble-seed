import INotification from "./INotification";

export interface NotificationGroupList {
	[type: string]: INotification;
}

export interface ToggleComponent {
	windowName: string;
	componentType: string;
	hideAction?: Function;
	showAction?: Function;
}
