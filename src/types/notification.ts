interface INotification {
    /* If not set by Service sending the notification automatically set to UUID. */
    id: string;
    /* Used for historical purposes. */
    createdTimestamp: string;
    filters: Filter;
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

interface IAction {
    /* Used to identify what should be done when action is triggered by user. IE: CONFIRM, REJECT, SNOOZE; */
    key: string;
    /* Display label in UI. */
    label: string;
}

interface Subscription {
    id: string; /* uuid generated */
    onNotification(notification: INotification); /* Callback for notification*/
}

interface FilteredSubscription {
    [filterId: string]: Subscription;
}

interface Filter {
    [key: string]: string;
} 

interface INotificationService {
    /* 
        Persist a notification via the StorageClient 
    */
    createNotification(notification: INotification): boolean;
    /* 
        Delete a notification via the StorageClient 
    */
    deleteNotification(id: string): void;
    /* 
        Update a notification via the StorageClient 
    */
    updateNotification(notification: INotification): void;
    /* 
        Update / Persist the last time a notification was save using the StorageClient. 
        This is used during startup to fetch and notification that happened with desktop was shutdown. 
    */
    saveLastUpdatedTime(lastUpdatedTimestamp: string, filter: Filter): boolean;
    /* 
        Per notification type configure display how often they're displayed.
        Per event type configure what sound you'd like to hear when that notification occurs.
        Both using the ConfigClient.
    */
    saveUserPreferences(preferences: Map<string, string>): boolean;
    /* 
        Update the stored notification via the StorageClient to mark action as being preformed.
    */    
    handleNotificationAction(notification: INotification, action: IAction): void;
    /* 
        When incoming notification arrive, lookup matching subscriptions and call nessesary callbacks
        on subscription.
    */    
    sendNotification(notification: INotification): string;
    /* 
        Hash function to take Filter name/value object to return a filterId. 
    */    
    filterHashFunction(filter: Filter): string;
    /* 
        Array of subscriptions for a particular set of filters.
    */    
    subscriptions: FilteredSubscription[];    
}

interface INotificationClient {
    /* 
        Subscribe for a set of name/value pair filters. Returns subscriptionId
    */    
    subscribe(filters: [], onNotification, onSubscriptionSuccess, onSubscriptionFault): string;
    /* 
        Remove subscription
    */    
    unsubscribe(subscriptionId: string): void;
    /*
        Return lastUpdatesTime for a filter
    */
    getLastUpdated(filter: Filter): string;
    /* 
        Used by UI components that need to display a list of historical notifications.
    */
    fetchSnapshot(lastUpdatedTime: string, filter: Filter): INotification[];
}

export { INotification, INotificationService, INotificationClient, Filter };