/*
* The baseStorage model provides several utility functions, such as `getCombinedKey`, which will produce a compound key string (for use with a simple key:value store) incorporating the username, topic, and key. For example: For the default user, Finsemble topic and activeWorkspace key: `Finsemble:defaultUser:finsemble:activeWorkspace.`
.
*/
var BaseStorage = require("@finsemble/finsemble-core").models.baseStorage;
var {
    Clients: { Logger },
} = require("@finsemble/finsemble-core");
//Because calls to this storage adapter will likely come from many different windows, we will log successes and failures in the central logger.
Logger.start();

const InMemoryStorageAdapter = function () {
    // #region Initializes a new instance of the InMemoryStorageAdapter.
    BaseStorage.call(this, arguments);

    this.myStorage = {};

    /**
     * Save method.
     * @param {object} params
     * @param {string} params.topic A topic under which the data should be stored.
     * @param {string} params.key The key whose value is being set.
     * @param {any} params.value The value being saved.
     * @param {function} cb callback to be invoked upon save completion
     */
    this.save = (params, cb) => {
        //Retrieves a key that looks like this:
        //applicationUUID:userName:topic:key
        const combinedKey = this.getCombinedKey(this, params);
    
        //Assign the value to the key on our storage object.
        this.myStorage[combinedKey] = params.value;
    
        return cb(null, { status: "success" });
    };

    /**
     * Get method.
     * @param {object} params
     * @param {string} params.topic A topic under which the data should be stored.
     * @param {string} params.key The key whose value is being set.
     * @param {function} cb callback to be invoked upon completion
     */
    this.get = (params, cb) => {
        const combinedKey = this.getCombinedKey(this, params);
        const data = this.myStorage[combinedKey];
        return cb(null, data);
    };

    /**
     * Returns all keys that we're saving data for.
     * @param {*} params
     * @param {*} cb
     */
    this.keys = (params, cb) => {
        const keyPreface = this.getKeyPreface(params);
        const allKeys = Object.keys(this.myStorage);
        const keys = allKeys.filter((key) => key.startsWith(keyPreface)).map((key) => key.replace(keyPreface, ""));
        return cb(keys);
    };

    /**
     * Delete method.
     * @param {object} params
     * @param {string} params.topic A topic under which the data should be stored.
     * @param {string} params.key The key whose value is being deleted.
     * @param {function} cb callback to be invoked upon completion
     */
    this.delete = (params, cb) => {
        const combinedKey = this.getCombinedKey(this, params);
        delete this.myStorage[combinedKey];
        cb();
    };

    /**
     * This method should be used very, very judiciously. It's essentially a method designed to wipe the database for a particular user.
     */
    this.clearCache = (params, cb) => {
        const userPreface = this.getUserPreface(this);
        Object.keys(this.myStorage).forEach((key) => {
            if (key.startsWith(userPreface)) {
                delete this.myStorage(key);
            }
        });
    
        cb(null, { status: "success" });
    };

    /**
     * Wipes the storage container.
     * @param {function} cb
     */
    this.empty = (cb) => {
        this.myStorage = {};
        cb();
    };

    /**
     * Get the prefix used to filter keys for particular topics and key prefixes.
     *
     * @param {object} params
     * @param {string} params.topic The topic
     * @param {string} params.keyPrefix The key prefix (optional).
     * @private
     */
    this.getKeyPreface = (params) => {
        const keyPrefix = "keyPrefix" in params ? params.keyPrefix : "";
        const preface = `${this.getUserPreface()}:${params.topic}:${keyPrefix}`;

        return preface;
    };

    /**
     * Get prefix for all the user's stored data.
     * @private
     */
    this.getUserPreface = () => {
        const preface = `${this.baseName}:${this.userName}`;
        return preface;
    };
};

InMemoryStorageAdapter.prototype = new BaseStorage();
new InMemoryStorageAdapter("InMemoryStorageAdapter");
module.exports = InMemoryStorageAdapter;