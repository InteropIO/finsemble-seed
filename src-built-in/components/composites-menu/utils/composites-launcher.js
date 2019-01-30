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
    _launchHeader(compositeName, compositeObject)
        .then((res) => {
            let index = 0
            const components = compositeObject.components
            const next = () => {
                if (index < components.length - 1) {
                    index = index + 1
                    _spawnComponent(components[index], compositeObject).then(next)
                }
            }
            _spawnComponent(components[index], compositeObject).then(next)
        })
}

function _launchHeader(compositeName, compositeObject) {
    return new Promise((resolve, reject) => {
        // Launch composite header component
        FSBL.Clients.LauncherClient.spawn("Composites Header", {
            width: compositeObject.width,
            height: 25,
            top: 60,
            left: 0,
            options: {
                maxHeight: 25,
                minHeight: 25,
                smallWindow: true,
                customData: {
                    foreign: {
                        components: {
                            "Window Manager": {
                                title: compositeName
                            }
                        }
                    }
                }
            }
        }, (error, response) => {
            if (error) {
                reject(error)
            } else {
                resolve(response)
            }
        })
    })
}

function _launchComponents(components) {
    /**
     * @todo Get the following working once LauncherService.spawnGroup is fixed
     */
    /*
    const componentsObject = {}
    components.forEach((component) => {
        componentsObject[component.name] = {
            width: component.config.window.width,
            height: component.config.window.height,
            // 30px is used by the composite FSBLheader-only component
            top: component.config.window.top + 95,
            left: component.config.window.left,
            dockOnSpawn: true,
            relativeWindow: windows.header,
            options: {
                customData: component.config
            }
        }
    })
    FSBL.Clients.LauncherClient.spawn(componentsObject, (error, response) => {
        console.log(error, response)
    })
    */
}

function _spawnComponent(component, compositeObject) {
    return new Promise((resolve, reject) => {
        FSBL.Clients.LauncherClient.spawn(component.name, {
            width: component.config.window.width,
            height: component.config.window.height,
            // 30px is used by the composite FSBLheader-only component
            top: component.config.window.top + 95,
            left: component.config.window.left,
            //dockOnSpawn: true,
            //relativeWindow: windows.header,
            options: {
                customData: component.config
            }
        }, (error, response) => {
            if (!error) {
                resolve(response)
            } else {
                reject(error)
            }
        })
    })
}