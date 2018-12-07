export default {
    getStore,
    prepareStore,
    addComposite,
    deleteComposite
}

// The persistent store reference
let store
/**
 * Returns store reference
 */
function getStore(){
    return store
}
/**
 * Gets the persistent store and keeps a reference for it
 * @param {function} cb The callback function
 */
function prepareStore(cb) {
    FSBL.Clients.DistributedStoreClient
        .getStore({
            store: "composites",
            global: true
        }, (error, storeObj) => {
            store = storeObj
            cb && cb()
        })
}
/**
 * Adds a JSON configuration for a new composite
 * @param {object} composite The composite object
 */
function addComposite(compositeName, composite) {
    store.setValue({field: compositeName, value: composite})
}
/**
 * Deletes a composite from the store
 * @param {string} compositeName The composite name to delete
 */
function deleteComposite(compositeName) {
    // @TODO  Modify StoreModel so that it deletes the value
    // and not only nullify it
    store.removeValue({field: compositeName})
}

