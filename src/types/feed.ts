import { INotification } from './notification';

interface IFeedService {
    /*
      Called whenever a new notification is delivered from a remote source. The send function needs to be
      called whenever a notification needs to be sent to the notification service.
    */
    onNotification: (notification: INotification) => void;
    /*
        Called whenever a new notification is received successfully in Finsemble. Useful for logging,
        error handleing, or reporting back to the remote service, etc...
    */    
    notificationReceived?(receivedTime: string): void;
}

interface IFeedDataService {
    /*
        Most likely will query a remote source for notifications at a point in time. Used to pull in
        notifications which occurred when Finsemble was offline.
    */
    query(lastUpdatedTimestamp: string): INotification[];
    /*
        This function will be implemented by Finsemble developer and needs to call FeedService.onNotification
        each time it wants to send a notification through the system.
    */
    processNotifications(): void;
}

interface IFeedClient {
    /* 
       Helper method for NotificationsClient to fetch any notifications received while it was shutdown. 
       This will call FeedService.query which will do the actual heavy lifting.
    */
    fetchSnapshot(lastUpdatedTimestamp: string): INotification[];
    /* 
       Helper method for NotificationsClient. This will call FeedService.handleNotification
       with a call back which is triggered whenever a notification needs to be delivered.
    */
    listenForNotifications(responder: Function): void;
}

export { IFeedService, IFeedDataService, IFeedClient };