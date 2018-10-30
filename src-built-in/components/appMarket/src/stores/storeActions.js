/*!
* Copyright 2018 by ChartIQ, Inc.
* All rights reserved.
*/
import AppDirectory from '../modules/AppDirectory'
import FDC3 from '../modules/FDC3'
import { getStore } from './appStore';

export default {
    getApps,
    searchApps,
    getActiveTags,
    getTags,
    addTag,
    removeTag,
    clearTags
}

/**
 * I'm thinking of using  a local distributed store and the FDC3 client
 * Some data will be pulled from appd and some from the local store
 * Not sure if the localstore needs to be a persistent one at some point?
 */
const FDC3Client = new FDC3({url: 'http://localhost:3030/v1'})
const appd = new AppDirectory(FDC3Client);

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

    getStore().setValue({
        field: 'apps',
        value: newApps
    });

    getStore().setValue({
        field: 'activeTags',
        value: activeTags
    });
}

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

function _clearActiveTags() {
    getStore().setValue({
        field: 'activeTags',
        value: []
    });
}

function getApps() {
    return appd.getAll()
}

function getTags() {
    return appd.getTags()
}

function getActiveTags() {
    return getStore().getValue({
        field: 'activeTags'
    });
}

function addTag(tag) {
    _addActiveTag(tag);
}

function removeTag(tag) {
    _removeActiveTag(tag);
}

function clearTags() {
    _clearActiveTags();
}

function searchApps(terms) {
    let activeTags = getStore().getValue({
        field: 'activeTags'
    });

    appd.search({ text: terms, tag: activeTags }, (err, data) => {
        if (err) console.log("Failed to search apps");
        return data;
    });
}


// function addApp(appName) {
//     let newApps = values.apps.map((app) => {
//         let appTitle = app.title || app.name

//         if (appTitle === appName) {
//             app.installed = true
//         }
//         return app
//     })
//     values.apps = newApps
// }
// function removeApp(appName) {
//     let newApps = values.apps.map((app) => {
//         let appTitle = app.title || app.name
//         if (appTitle === appName && app.installed) {
//             delete app.installed
//         }
//         return app
//     })
//     values.apps = newApps
// }
// function clearSearchResults() {
//     values.filteredCards = []
// }