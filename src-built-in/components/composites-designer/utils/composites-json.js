import { rejects } from "assert";

export default {
    generate
}
/**
 * Takes a name and an array of htmlElements representing
 * the golden layout components, extracts the names and dimensions
 * from layout and returns a composite object
 * @param {string} name The name of the composite
 * @param {array} stacks An array of component stacks
 */
function generate(name, stacks) {
    return new Promise(async (resolve) => {
        // Initial config with composite width and height
        // set to window width and height
        const config = {
            width: window.innerWidth,
            height: window.innerHeight,
            components: []
        }
        // Interate through all blocks/stacks
        // Extract title, and dimensions
        for (const key in stacks) {
            const stack = stacks[key]
            // A bad element that we probably don't need
            if (!stack.getElementsByTagName) continue
            // Continue parsing
            const name = stack.getElementsByTagName('span')[0].innerHTML
            const defaultConfig = (await FSBL.Clients.LauncherClient
                .getComponentDefaultConfig(name)).data
            // Override window's width, height , top and left
            defaultConfig.window = Object.assign(defaultConfig.window, {
                width: stack.offsetWidth,
                height: stack.offsetHeight,
                top: stack.offsetTop,
                left: stack.offsetLeft
            })
            // We also need to hide the header
            // @todo Do this in a better and shorter way, maybe deep Object.assign?
            try {
                defaultConfig.foreign.components["Window Manager"].FSBLHeader = false
            } catch (e) {
                // @todo rebuild config if needed
                console.log('Failed', defaultConfig)
            }
            // Push the component to the array
            config.components.push({
                component: name,
                params: defaultConfig
            })
        }
        // Return a named composites entry
        resolve(config)
    })
}