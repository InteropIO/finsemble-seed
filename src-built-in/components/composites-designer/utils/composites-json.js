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
            // Get the current top and left for this composite
            // just incase we end up using it as the composite's
            // default spawn position
            top: window.screenTop,
            left: window.screenLeft,
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
                width: stack.clientWidth,
                height: stack.clientHeight,
                top: stack.offsetTop,
                left: stack.offsetLeft
            })
            // Push the component to the array
            config.components.push({
                name: name,
                config: defaultConfig
            })
        }
        // Return a named composites entry
        resolve(config)
    })
}