import { INotification, Filter } from './notification';

interface IFeedService {
    /**
     * Queries a remote source for notifications at a point in time. Used to pull in
     * notifications which occurred when Finsemble was offline.
     * @param {Date} date / time to query from.
     * @param {Filter} filter to used to match notifications on.
     * @returns {INotification} 
     * @private
     */
    query(since: Date, filter: Filter): INotification[];
}

export { IFeedService };