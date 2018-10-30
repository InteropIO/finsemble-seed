/*!
* Copyright 2018 by ChartIQ, Inc.
* All rights reserved.
*/
import AppDirectory from '../modules/AppDirectory'
import FDC3 from '../modules/FDC3'
import { getStore } from './appStore';

export default {
    fetchApps,
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

function _setTags() {
    let apps = getStore().getValue({
        field: 'apps'
    });

    let tags = []
    for (let j = 0; j < apps.length; j++) {
        let app = apps[j]
        for (let i = 0; i < app.tags.length; i++) {
            let tag = app.tags[i]
            if (!tags.includes(tag)) {
                tags.push(tag)
            }
        }
    }

    getStore().setValue({
        field: 'tags',
        value: tags
    }, (err, data) => {
        if (err) console.log('Failed to set tags list');
    });
}

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
    return getStore().getValue({
        field: 'apps'
    });
}

function fetchApps() {
    appd.getAll((err, apps) => {
        if (err) console.log('Error loading apps');
        getStore().setValue({
            field: 'apps',
            value: apps
        }, (storeSetErr, data) => {
            if (storeSetErr) console.log('Error setting apps');
            _setTags();
        })
    });
}

function getTags() {
    return getStore().getValue({
        field: 'tags'
    });
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