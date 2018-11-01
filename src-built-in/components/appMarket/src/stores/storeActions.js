/*!
* Copyright 2018 by ChartIQ, Inc.
* All rights reserved.
*/
import AppDirectory from '../modules/AppDirectory'
import FDC3 from '../modules/FDC3'
import { getStore } from './appStore';

export default {
    getApps,
    getFilteredApps,
    clearFilteredApps,
    searchApps,
    getActiveTags,
    getTags,
    addTag,
    removeTag,
    clearTags,
    addApp,
    removeApp,
    fetchInstalledApps,
    getInstalledApps
}

/**
 * I'm thinking of using  a local distributed store and the FDC3 client
 * Some data will be pulled from appd and some from the local store
 * Not sure if the localstore needs to be a persistent one at some point?
 */
const FDC3Client = new FDC3({url: 'http://localhost:3030/v1'})
const appd = new AppDirectory(FDC3Client);

/**
 * Private function to add an active tag. This will filter apps based on tags
 * NOTE: This will need to use search
 * @param {string} tag The name of the tag
 */
function _addActiveTag(tag) {
    let activeTags = getStore().getValue({
        field: 'activeTags'
    });

    let apps = getStore().getValue({
        field: 'apps'
    });

    activeTags.push(tag);

    let newApps = apps.filter((app) => {
        for (let i = 0; i < activeTags.length; i++) {
            let tag = activeTags[i];
            if (app.tags.includes(tag)) {
                return true;
            }
        }
    });

    // getStore().setValue({
    //     field: 'filteredApps',
    //     value: newApps
    // });

    // getStore().setValue({
    //     field: 'activeTags',
    //     value: activeTags
    // });

    getStore().setValues([
        {
            field: 'filteredApps',
            value: newApps
        },
        {
            field: 'activeTags',
            value: activeTags
        }
    ]);
}

/**
 * Private function to remove an active tag. This will filter apps based on tags
 * NOTE: This will need to use search
 * @param {string} tag The name of the tag
 */
function _removeActiveTag(tag) {
    let activeTags = getStore().getValue({
        field: 'activeTags'
    });

    let newActiveTags = activeTags.filter((currentTag) => {
        return currentTag !== tag;
    });

    getStore().setValue({
        field: 'activeTags',
        value: newActiveTags
    });
}

/**
 * Clears all active tags
 */
function _clearActiveTags() {
    getStore().setValue({
        field: 'activeTags',
        value: []
    });
}

/**
 * Async function to fetch apps from the FDC3 api (appD)
 */
function getApps() {
    appd.getAll((err, apps) => {
        getStore().setValue({
            field: 'installed',
            value: [apps[0].appId]
        });
    });
    return appd.getAll();
}

/**
 * Function to "install" an app. Adds the id to a list of installed apps
 * @param {string} name The name of the app
 */
function addApp(name) {
    // let apps = getStore().getValue({
    //     field: 'apps'
    // });

    // let installed = getStore().getValue({
    //     field: 'installed'
    // });
    let { installed, apps } = getStore().getValues([
        {
            field: 'apps'
        },
        {
            field: 'installed'
        }
    ])

    for (let i = 0; i < apps.length; i++) {
        let app = apps[i];
        let thisAppName = app.title || app.name;
        if (thisAppName === name && !installed.includes(app.appId)) {
            installed.push(app.appId);
            break;
        }
    };

    getStore().setValue({
        field: 'installed',
        value: installed
    });
}

/**
 * Function to "uninstall" an app. Removes the id from a list of installed apps
 * @param {string} name The name of the app
 */
function removeApp(name) {
    let apps = getStore().getValue({
        field: 'apps'
    });

    let installed = getStore().getValue({
        field: 'installed'
    });

    for (let i = 0; i < apps.length; i++) {
        let app = apps[i];
        let thisAppName = app.title || app.name;
        if (thisAppName === name && installed.includes(app.appId)) {
            let index = installed.indexOf(app.appId);
            installed.splice(index, 1);
            break;
        }
    }

    getStore().setValue({
        field: 'installed',
        value: installed
    });
}

/**
 * Gets the list of installed apps
 */
function getInstalledApps() {
    return getStore().getValue({
        field: 'installed'
    });
}

/**
 * Gets the list of filtered apps (when searching/filtering by tags)
 */
function getFilteredApps() {
    return getStore().getValue({
        field: 'filteredApps'
    });
}

/**
 * Clears the list of filtered apps
 */
function clearFilteredApps() {
    getStore().setValue({
        field: 'filteredApps',
        value: []
    });
}

/**
 * Call to appD to get the list of all tags
 */
function getTags() {
    return appd.getTags()
}

/**
 * Gets the list of active tags (these are tags that are actively filtering the content list)
 */
function getActiveTags() {
    return getStore().getValue({
        field: 'activeTags'
    });
}

/**
 * Adds an 'active tag' to the list of filtered tags
 * @param {string} tag The tag name
 */
function addTag(tag) {
    _addActiveTag(tag);
}

/**
 * Removes an 'active tag' from the list of filtered tags
 * @param {string} tag The tag name
 */
function removeTag(tag) {
    _removeActiveTag(tag);
}

/**
 * Removes all tags from the active tags list
 */
function clearTags() {
    _clearActiveTags();
}

/**
 * Calls appD to search the directory of apps based on search text and tag names
 * @param {string} terms The search terms provided by the user
 */
function searchApps(terms) {
    let activeTags = getStore().getValue({
        field: 'activeTags'
    });

    appd.search({ text: terms, tags: activeTags }, (err, data) => {
        if (err) console.log("Failed to search apps");
        getStore().setValue({
            field: 'filteredApps',
            value: data
        });
    });
}

/**
 * Retrieves a list of installed apps by id
 */
function getInstalledApps() {
    return getStore().getValue({
        field: 'installed'
    });
}

/**
 * Async function to call the launcher client to get a list of added apps
 */
function fetchInstalledApps() {
    //NOTE: This is a WIP. This api may change so its commented out for now
    // FSBL.Clients.LauncherClient.getComponentList((err, apps) => {
    //     if (err) console.log("Error fetching list of added apps");
    //     getStore().setValue({
    //         field: 'installed',
    //         value: apps
    //     });
    //     return apps;
    // });
    let apps = getStore().getValue({
        field: 'apps'
    });

    let installed = [];
    if (apps.length > 0) installed.push([apps[0].appId]);

    getStore().setValue({
        field: 'installed',
        value: installed
    });
}