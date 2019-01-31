export default {
    launch
}

/**
* Takes the composite's components, modifies their top and left position
 * and spawns them one by one, then finaly link them to the composite window component
 * @param {string} compositeName The composite's name
 * @param {object} compositeObject The composite's object (components, position, etc)
 */
function launch(compositeName, compositeObject) {
    //@todo we need to be able to register composites so that the launcher can read them. That will be possible when app catalog gets merged.
    FSBL.Clients.LauncherClient.spawn({ type: "composite", name: compositeName }, {});
}