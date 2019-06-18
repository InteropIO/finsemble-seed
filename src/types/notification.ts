interface INotification {
    id: string;
    externalId: string;
    type: string;
    content: [];
    timeout?: string;
    meta?: Map<string, any>;
}

interface INotificationService {
    saveNotification: { (notification: INotification): boolean; };
    saveLastUpdatedTimestamp: { (saveLastUpdatedTimestamp: string): boolean; };
    saveUserPreferences: { (preferences: Map<string, string>): boolean; };
    handleNotificationAction: { (notification: INotification, actionPreformed: string) }
}

interface INotificationClient {
    notify: { (notification: INotification): string };
    registerNotificationResponder: { (subscription: Subscription): string };
    deregisterNotificationResponder: { (subscriptionId:string ): boolean };
    registerActionResponder: { () };
    deregisterActionResponder: { () };
    fetchSnapshot: { (): INotification[] };
}

interface Subscription {
    id: string;
    channelName: string;
    filters: Map<string, string>;
}

export { INotification, INotificationService, INotificationClient };