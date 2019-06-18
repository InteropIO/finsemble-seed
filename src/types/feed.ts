import { INotification } from './notification';

interface IFeedService {
    handleNotification: any;
    notificationRecieved: string;
    query: { (lastUpdatedTimestamp: string): INotification[]; };
}

interface IFeedClient {
    fetchSnapshot: { (lastUpdatedTimestamp: string): INotification[] };
}

export { IFeedService, IFeedClient };