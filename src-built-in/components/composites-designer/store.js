export {
    getStore,
    createStore,
}

// The store object
let store

function getStore() {
    return store
}

/**
 * Creates a store and invokes the callback
 * @param {function} cb The call back function
 */
function createStore(cb) {
    FSBL.Clients.DistributedStoreClient
        .createStore({
            store: "composites-designer",
            global: false
        }, (error, storeObj) => {
            store = storeObj
            cb()
        })
}
