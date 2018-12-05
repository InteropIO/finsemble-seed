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
    // Initial config with composites width and height
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
        // Push the component to the array
        config.components.push({
            name: name,
            config: {
                width: stack.clientWidth,
                height: stack.clientHeight,
                top: stack.offsetTop,
                left: stack.offsetLeft
            }
        })
    }
    // Return a name composites entry
    return config
}