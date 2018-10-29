/*!
* Copyright 2018 by ChartIQ, Inc.
* All rights reserved.
*/
import AppDirectory from '../modules/AppDirectory'
import FDC3 from '../modules/FDC3'

export default {
    setTags,
    getApps,
    searchApps,
    getFilteredApps,
    clearSearchResults,
    getActiveTags,
    getTags,
    addTag,
    removeTag,
    clearTags,
    addApp,
    removeApp,
}

/**
 * I'm thinking of using  a local distributed store and the FDC3 client
 * Some data will be pulled from appd and some from the local store
 * Not sure if the localstore needs to be a persistent one at some point?
 */
const FDC3Client = new FDC3({url: 'http://localhost:3030/v1'})
const appd = new AppDirectory(FDC3Client)

function setTags() {
    let tags = []
    for (let j = 0; j < values.apps.length; j++) {
        let app = values.apps[j]
        for (let i = 0; i < app.tags.length; i++) {
            let tag = app.tags[i]
            if (!tags.includes(tag)) {
                tags.push(tag)
            }
        }
    }
    values.allTags = tags
}
function getApps() {
    return appd.getAll()
}
/**
 * 
 * @param {object} searchTerms The search params
 * @example searchApps({text: 'sometext', tag: 'sometag'})
 */
function searchApps(searchTerms) {
    return appd.search(searchTerms)
}
function getFilteredApps() {
    return values.filteredCards
}
function getTags() {
    return values.allTags
}
function getActiveTags() {
    return values.activeTags
}
function addTag(tag) {
    values.activeTags.push(tag)
    let tags = values.activeTags
    let newApps = values.apps.filter((app) => {
        for (let i = 0; i < app.tags.length; i++) {
            let tag = tags[i]
            if (app.tags.includes(tag)) {
                return true
            }
        }
        return false;
    });

    values.filteredCards = newApps;
}
function removeTag(tagName) {
    let newTags = values.activeTags.filter((tag) => {
        return tag !== tagName
    })
    values.activeTags = newTags
}
function clearTags() {
    values.activeTags = []
}
function addApp(appName) {
    let newApps = values.apps.map((app) => {
        let appTitle = app.title || app.name

        if (appTitle === appName) {
            app.installed = true
        }
        return app
    })
    values.apps = newApps
}
function removeApp(appName) {
    let newApps = values.apps.map((app) => {
        let appTitle = app.title || app.name
        if (appTitle === appName && app.installed) {
            delete app.installed
        }
        return app
    })
    values.apps = newApps
}
function clearSearchResults() {
    values.filteredCards = []
}