[![Finsemble SmartDesktop](./public/assets/img/Finsemble+Cosaic.svg)](https://documentation.finsemble.com/)

# Finsemble Recipe: MongoDB Storage Adapter

Finsemble's built-in storage adapters use Chromium's IndexedDB and local storage to persist the user's data between sessions. However, the need often arises to persist data in remote storage within a database for scalability, security, and sustainability. This recipe shows how a pared-down instance of the IndexedDB adapter can be modified to work with MongoDB.

For background information on storing data with Finsemble, consult [this tutorial](https://documentation.chartiq.com/finsemble/tutorial-storingData.html).

## Setup

For the purposes of this recipe, we'll be standing up a previously written Node.js Express server to communicate with our Mongo instance.

1. Follow the [official instructions](https://docs.mongodb.com/manual/administration/install-community/) to download and install MongoDB Community Edition. The exact setup of MongoDB is outside the scope of this tutorial, but there are many reference guides and walk-throughs to help you get set up.
1. Architecturally, you will want to decide how to facilitate communication between your project and the database. For demonstration purposes, a small Node.js application using Express has been provided for a quickstart. **Note that this is not a production-level application and is provided only for educational purposes**. Clone it from [here](https://github.com/sonyl-ciq/mongodb-express).
1. Set up the application:
    1. `git clone git@github.com:sonyl-ciq/mongodb-express.git`
    1. `cd mongodb-express`
    1. `npm install`
1. Make a note of the port number upon which the application is running (the `app.listen()` directive in _app.js_) and change it as necessary for your needs. Note that port 80 usually requires elevated permissions, so using port 3000 or 3001 can be useful to avoid permissioning problems or in-use ports. We'll be using port 3001 on localhost.
1. Open `routes/get.js`and change the `url` variable as needed. Be sure to include the username and password for your new MongoDB instance if needed.
1. Start the application: `npm start`
1. Test that the application is running by accessing the index page at `http://localhost:3001`. <br /><br/> ![](https://gist.githubusercontent.com/sonyl-ciq/6fa9eff051e53e3f4337134788866cd2/raw/6bdbf9d4a7d4bf47a54b7c81376f7f029218f93a/welcome-to-express.png)
1. Test your connection to MongoDB at `http://localhost:3001/ping`. <br /><br /> ![](https://gist.githubusercontent.com/sonyl-ciq/6fa9eff051e53e3f4337134788866cd2/raw/6bdbf9d4a7d4bf47a54b7c81376f7f029218f93a/ping.png)
1. If you do not see `{"status":200}`, check that MongoDB is running and accepting connections.

We're ready to construct our storage adapter.

## The Storage Adapter

Your use case for a storage adapter may be highly nuanced, so we'll begin with only the essentials of our storage adapter. At its core, there are four methods needed: **get**, **save**, **keys**, and **delete**.

We'll begin our adapter in _src/adapters/MongoStorageAdapter.js_ as such:

```js
const BaseStorage = require("@chartiq/finsemble").models.baseStorage;
const Logger = require("@chartiq/finsemble").Clients.Logger;

Logger.start();

class MongoStorageAdapter extends BaseStorage {
	constructor(uuid) {
		super(arguments);
		this.baseURL = "http://localhost:3001";

        this.ROUTES = {
           	SAVE: `${this.baseURL}/save`,
           	GET: `${this.baseURL}/get`,
           	KEYS: `${this.baseURL}/keys`,
           	DELETE: `${this.baseURL}/delete`
        }
	}

	/**
	 * Get method.
	 * @param {object} params
	 * @param {string} params.topic A topic under which the data should be stored.
	 * @param {string} params.key The key whose value is being set.
	 * @param {function} cb Callback to be invoked upon completion.
	 */
	get = function(params, cb) {
		
	}

	/**
	 * Save method.
	 * @param {object} params
	 * @param {string} params.topic A topic under which the data should be stored.
	 * @param {string} params.key The key whose value is being set.
	 * @param {any} params.value The value being saved.
	 * @param {function} cb Callback to be invoked upon save completion.
	 */
	save = function(params, cb) {
		
	}

	/**
	 * Returns all keys stored in MongoDB.
	 *
	 * @param {object} params
	 * @param {function} cb
	 */
	keys = function(params, cb) {

	}

	/**
	 * Delete method.
	 * @param {object} params
	 * @param {string} params.topic The topic under which the data is stored.
	 * @param {string} params.key The key whose value is being deleted.
	 * @param {function} cb Callback to be invoked upon completion.
	 */
	delete = function(params, cb) {
		
	}
}

let mongoAdapter = new MongoStorageAdapter("MongoStorageAdapter")
module.exports = mongoAdapter; 


```

The Storage service in Finsemble provides multiple variables that can be used to address stored data. In our MongoDB example, however, we're going to work with simple key:value pairs. This means that keys are a multipart strings and therefore it's useful to have a helper function to construct what we'll refer to as the _combined key_. The helper `getCombinedKey` is provided for you in the baseStorage model within Finsemble; by extending our adapter from BaseStorage, it will inherit this helper. You should also include the Logger client for debugging purposes.

Note that you do not have to use the `getCombinedKey` helper, particularly if you intend to store data in a multi-column format using all of the variables provided.

Each of our methods will take a **params** object and a **cb** callback method.

### Database Architecture

Finsemble expects to work with key/value pairs, but as we'll see, its data can come from anywhere as long as it's properly formatted. Here's an example of what data for Finsemble could look like:

| **Key** | **Value** |
|--|--|
| `Finsemble:defaultUser:finsemble.workspace:finsemble.allWorkspaces` | `[ "Default Workspace" ]` |


The overall key is comprised of four pieces, colon-delimited: 
		
1. The preface **Finsemble**
1. A representation of the username
1. The **topic** for the record (cf. the topicToDataStoreAdapters in the _config.json_ for the built-in topics.) We'll be working with `finsemble` and `finsemble.workspace`, but you may create your own topics in which to store data.
1. The individual key for this entry

If you've explored the entries in IndexedDB with the Developer Tools, you've seen how Finsemble expects its key/value pairs: ![](https://gist.githubusercontent.com/sonyl-ciq/6fa9eff051e53e3f4337134788866cd2/raw/6bdbf9d4a7d4bf47a54b7c81376f7f029218f93a/indexeddb.png)

Now we're ready to save data into our blank database.

### `save`

The Express application expects our save data as a POST on the `/save` route as stringified JSON of one key and one value. Here's an example of how your save function could look:

```js
save = function(params, cb) {
    let combinedKey = this.getCombinedKey(this, params);

    Logger.system.debug("Mongo.save for key=" + combinedKey + " with data=" + params.value);
    
    fetch(`${this.ROUTES.SAVE}`, {
        method: "POST",
        body: JSON.stringify({ key: combinedKey, value: params.value }),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(data => {
        cb(null, { status: "success" });
    })      
    .catch(err => {
        Logger.system.error("Mongo.save Error", err, "key=" + combinedKey, "value=", params.value);
        cb(err, { status: "failed" });
    });
};

```

At each step of our adapter, it's important to invoke the callback function in order to maintain communication with all the moving parts of Finsemble.

### `get`

The **get** method of our Express application expects a query string argument of "key", which is our aforementioned combined key. Our storage adapter's **get** method could look like this:

```js
get = function(params, cb) {
    let combinedKey = this.getCombinedKey(this, params);
    
    fetch(`${this.ROUTES.GET}?key=${combinedKey}`)
        .then(response => response.json())
        .then(data => {
            Logger.system.debug("Mongo.get for key=" + combinedKey + " data=", data.value);
            cb(null, data.value);
        })
        .catch(err => {
            Logger.system.error("Mongo.get key=" + combinedKey + ", Error", err);
            cb(err, { status: "failed" });
        });
};

```

Again, note the explicit invocation of the callback functions.

### `delete`

The **delete** method is similar to **save**:

```js
delete = function(params, cb) {
    let combinedKey = this.getCombinedKey(this, params);

    Logger.system.debug("Mongo.delete for key=" + combinedKey);

    fetch(`${this.ROUTES.DELETE}`, {
        method: "DELETE",
        body: JSON.stringify({ key: combinedKey }),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(data => {
        cb(null, { status: "success" });
    })      
    .catch(err => {
        Logger.system.error("Mongo.delete key=" + combinedKey + ", Error", err);
        cb(err, { status: "failed" });
    });
};

```

Your storage adapter might have some additional needs, such as a `clear` function to remove all data associated with a user or a `cacheClear` function to clear the database completely. For now, we're ready to test our adapter. These methods should at least be be stubbed out to prevent errors from Finsemble calling these and returning errors.

### Completed Adapter Example

The completed adapter example is in this directory as [MongoStorageAdapter.js](./MongoStorageAdapter.js);

## Finsemble Setup

1. Open _configs/application/config.json_ and locate the `storage` object: 
    ```js
	"storage": {
            "defaultStorage": "MongoStorageAdapter",
            "topicToDataStoreAdapters": {
                "finsemble": "MongoStorageAdapter",
                "finsemble.workspace": "MongoStorageAdapter",
                "finsemble.workspace.cache": "IndexedDBAdapter"
            },
            "dataStoreAdapters": {
                "LocalStorageAdapter": "$applicationRoot/adapters/localStorageAdapter.js",
                "IndexedDBAdapter": "$applicationRoot/adapters/indexedDBAdapter.js",
                "MongoStorageAdapter": "$applicationRoot/adapters/MongoStorageAdapter.js"
            }
        }
    ```

1. Add a `dataStoreAdapter` as shown above.
1. Register your new adapter as `defaultStorage` so that it is used for any unspecified storage topics.
1. Map the `finsemble` and `finsemble.workspace` topics to your new adapter in `topicToDataStoreAdapters`. Note that `finsemble.workspace.cache` is a _high frequency_ topic (e.g., it's read and written every time a component is opened, dragged, resized, etc.) and thus should be maintained as a local storage adapter and _not_ saved to an external datastore.
1. Add your storage adapter to _build/webpack/webpack.adapters.entries.json_ to ensure it is built by webpack in the Finsemble seed project.
1. Start Finsemble: `npm run dev`.

## Testing

When Finsemble launches, you should see a flurry of GETs and POSTs in the console where the Express application is running. If you access the MongoDB instance, you should see roughly twenty documents created, covering a variety of workspace topics. Try creating a new workspace, saving it, deleting the IndexedDB _fsbl_ database with the Developer Tools, and relaunching Finsemble. With any luck, you'll have your new test workspace available to you.

## Troubleshooting

If all does _not_ go smoothly, first check the Central Logger for errors. The Storage Service console output may have useful information and other parts of the system (like the Workspace Service) may be waiting on your adapter and should throw errors.

You also may want to spend some time with a network debugging application like [Fiddler](https://www.telerik.com/fiddler) to examine communication between Finsemble and the Express application.

