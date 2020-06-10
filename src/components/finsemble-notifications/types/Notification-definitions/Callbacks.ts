import INotification from "./INotification";

/**
 * Defines the callback and parameters when creating a successful subscription
 */
export default interface OnSubscriptionSuccessCallback {
	(value: { id: string; channel: string }): void;
}

/**
 * Defines the callback and parameters when creating a subscription fails
 */
export interface OnSubscriptionFaultCallback {
	(error: Error): void;
}

/**
 * Defines the callback to and parameters pass into the onNotification function
 */
export interface OnNotificationCallback {
	(notification: INotification): void;
}
