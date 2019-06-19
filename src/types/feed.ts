import { INotification } from './notification';

interface IFeedService {
    /*
      Called from FeedService.processNotifications whenever a new notification is delivered from a remote source
      and need to be pushed into system. Registers a responder which to send notification to NotificationService.
    */
    handleNotification: (notification: INotification) => void;
}

interface IFeedDataService {
    /*
        Queries a remote source for notifications at a point in time. Used to pull in
        notifications which occurred when Finsemble was offline.
    */
    query(lastUpdatedTimestamp: string): INotification[];
    /*
        Needs to call FeedService.handleNotification each time it wants to send a notification through the system.
    */
    processNotifications(): void;
    /*
        Called whenever a new notification is received successfully in Finsemble. Useful for logging,
        error handleing, or reporting back to the remote service, etc...
    */    
    notificationReceived?(receivedTime: string, notification: INotification): void;
}

interface IFeedClient {
    /* 
       Helper method for NotificationsClient to fetch any notifications received while it was shutdown. 
       This will call FeedService.query which will do the actual heavy lifting.
    */
    fetchSnapshot(lastUpdatedTimestamp: string): INotification[];
}

export { IFeedService, IFeedDataService, IFeedClient };