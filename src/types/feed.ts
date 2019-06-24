import { INotification, Filter } from './notification';

interface IFeedService {
    /*
      Used to connect to remote source and calls RouterClient.transmit to send notifications to Finsemble.
    */
    broadcastNotifications: (notification: INotification[]) => void;
    /*
        Queries a remote source for notifications at a point in time. Used to pull in
        notifications which occurred when Finsemble was offline.
    */
    query(lastUpdatedTimestamp: string, filter: Filter): INotification[];
}

export { IFeedService };