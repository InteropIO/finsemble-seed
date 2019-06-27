interface INotification {
    /* If not set by Service sending the notification automatically set to UUID. */
    id: string;
    /* Used for historical purposes. */
    lastUpdated: Date;
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
    dismissed?: boolean;
}

interface IAction {
    /* Used to identify what should be done when action is triggered by user. IE: CONFIRM, REJECT, SNOOZE; */
    id: string;
    /* Display label in UI. */
    buttonText: string;
	type: string;
	component: string;
    /* params */
    params?: object;
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
    /**
     * Creates or updates notifications in Finsemble.
     * @param {INotification[]} notifications from external source to be created or updated in Finsemble.
     */
    notify(notification: INotification[]): void;
    /** 
     * Delete a notification as part of a purge.
     * @param {string} id of a notification 
     * @private
     */
    deleteNotification(id: string): void;
    /** 
	 * Update saveLastUpdated time when incoming notification arrives in Finsemble.
     * @param {Date} lastUpdated when alert was last delivered to Finsemble.
     * @param {Filter} filter to identify which notification to save lastUpdated time for.
     * @private
     */
    saveLastUpdatedTime(lastUpdated: Date, filter: Filter): void;
    /** 
     * Subscribing to ConfigClient for notifications preferences set by UIs.
	 * Per notification type configure display how often they're displayed.
	 * Per event type configure what sound you'd like to hear when that notification occurs.
     * @private
     */
    saveUserPreferences(preferences: Map<string, string>): void;
    /** 
     * Update the notification to mark actions preformed.
       @param {INotification[]} notifications to apply action to.
       @param {IAction} action which has been triggered by user.
     */    
    handleAction(notification: INotification[], action: IAction): void;
	/**
	 * When incoming notification arrive, lookup matching subscriptions and call nessesary callbacks on subscription.
	 * @param {INotification[]} Array of INotification objects to broadcast.
     * @private
	 */    
    broadcastNotifications(notification: INotification[]): void;
    /** 
	 * Hash function to return a filterId.
     * @param {Filter} name / value pairs are sorted and used to create a hash string.
     * @returns {string} hash from Filter.
     * @private
     */        
    filterHashFunction(filter: Filter): string;
    /** 
	 * Array of subscriptions for a particular set of filters.
     * @private
     */    
    subscriptions: FilteredSubscription[];    
}

interface INotificationClient {
    /** 
     * Subscribe for a set of name/value pair filters. Returns subscriptionId
     * @param {Filter} filter with name value pair used to match on.
     * @param {Function} onNotification called whenever a notification matching a specific filter is received in the NotificationService.
     * @param {Function} onSubscriptionSuccess called when subscription is succesfully created.
     * @param {Function} onSubscriptionFault if there is an error creating the subscription.
     */    
    subscribe(filter: Filter, onNotification: Function, onSubscriptionSuccess: Function, onSubscriptionFault: Function): string;
    /** 
     * Used to unsubscribe to notifications.
     * @param {string} subscriptionId which was returned when subscription was created.
     */    
    unsubscribe(subscriptionId: string): void;
    /** 
     * @param {Filter} filter to identify which notification to save lastUpdated time for.
     * @returns last updated Date object.
     */
    getLastUpdatedTime(filter?: Filter): Date;
    /** 
     * Used by UI components that need to display a list of historical notifications.
     * @param {Date} date / time to fetch notifications from.
     * @param {Filter} filter to match to notifications.
     * @returns {INotification[]} array of notifications.
     */
    fetchSnapshot(since: Date, filter: Filter): INotification[];
	/**
	 * When incoming notification arrive, lookup matching subscriptions and call nessesary callbacks on subscription.
	 * @param {INotification[]} Array of INotification objects to broadcast.
	 */    
    broadcastNotifications(notification: INotification[]): void;
    /**
	 * Creates or updates notifications in Finsemble.
	 * @param {INotification[]} Array of INotification
	 */    
    notify(notification: INotification[]): void;
    /** 
     * Update the notification to mark actions preformed.
       @param {INotification[]} notifications to apply action to.
       @param {IAction} action which has been triggered by user.
     */    
    handleAction(notification: INotification[], action: IAction): void;
}

export { INotification, INotificationService, INotificationClient, Filter };