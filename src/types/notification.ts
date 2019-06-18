interface IAction {
    /* Used to identify what should be done when action is triggered by user. IE: CONFIRM, REJECT, SNOOZE; */
    key: string;
    /* Display label in UI. */
    label: string;
}

interface INotification {
    /* Internal uuid */
    id: string;
    /* id from remote source useful for transitioning a single notification through a workflow. */
    externalId: string;
    type: string;
    content: {
        /* Display title */
        title: string;
        /* Main details */
        details: string;
    };
    /* Display header */
    header: string;
    /* Set of optional actions */
    actions: IAction[];
    /* How long should notification be displayed */
    timeout?: string;
    /* Additional meta data. */
    meta?: Map<string, any>;
}

interface INotificationService {
    /* Persist a notification using the StorageClient */
    saveNotification(notification: INotification): boolean;
    /* 
        Persist the last time a notification was save using the StorageClient. 
        This is used during startup to fetch and notification that happened with desktop was shutdown. 
    */
    saveLastUpdatedTimestamp(saveLastUpdatedTimestamp: string): boolean;
    /* 
        Per notification type configure display how often they're displayed.
        Per event type configure what sound you'd like to hear when that notification occurs.
        Both using the ConfigClient.
    */
    saveUserPreferences(preferences: Map<string, string>): boolean;
    /* 
        Update the stored notification via the StorageClient to mark action as being preformed.
    */    
    handleNotificationAction(notification: INotification, actionPreformed: string): void;
}

interface INotificationClient {
    handleNotification(notification: INotification): string;
    broadcast(notification: INotification): string;
    registerNotificationResponder(subscription: Subscription): string;
    deregisterNotificationResponder(subscriptionId:string ): boolean;
    registerActionResponder():void;
    deregisterActionResponder():void;
    fetchSnapshot(): INotification[];
}

interface Subscription {
    id: string;
    channelName: string;
    filters: Map<string, string>;
}

export { INotification, INotificationService, INotificationClient };