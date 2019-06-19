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

interface Subscription {
    /* Internal uuid */
    id: string;
    /* Name of channel used by UI Components to determine what data they receive. */
    channelName: string;
    /* Name value pair of filters to use for subscriptions. IE tradeId:12345 */
    filters: Map<string, string>;
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
    /* 
        Called whenever notification is recieved from FeedService.
    */    
    onNotification(notification: INotification): string;
    /* 
        Broadcast notification to listeners.
    */    
    broadcast(notification: INotification): string;
    /* 
        UI Components will subscribe for updates. The initial query per channel / filter combination will
        return the subscriptionId a concatination of channel name + filter. IE trades/12345.
    */    
    registerNotificationResponder(subscription: Subscription): string;
    /* 
        Remove stored subscription from NotificationService. Therefore, no more notifications will be sent 
        the UI components for that subscriptionId.
    */    
    deregisterNotificationResponder(subscriptionId:string ): boolean;
    /* 
        Internally used to register a query / responder to for actions dispatched VIA Finsemble UI Components. 
        When an action is received the notification stored in the service will updated with the action name
        and time it was performed.
    */    
    _registerActionResponder():void;
    /* 
        Cleanup of internal action responder.
    */ 
    _deregisterActionResponder():void;
    /* 
        User by UI components that need to display a list of historical notifications.
    */     
    fetchSnapshot(): INotification[];
}

export { INotification, INotificationService, INotificationClient };