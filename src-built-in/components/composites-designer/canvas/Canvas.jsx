import React from 'react'

/**
 * The canvas components, its where you drop apps in
 */
export default class Canvas extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            compositeName: '',
            components: [],
        }
        // Bind correct context
        this.closeWindow = this.closeWindow.bind(this)
    }
    componentWillMount() {
        // Subscribe to composites name input
        FSBL.Clients.RouterClient.addListener("composites:name", this.setTitle)
    }
    componentWillUnmount() {
        // Unsubscribe to composites name input
        FSBL.Clients.RouterClient.removeListener("composites:name", this.setTitle)
    }
    /**
     * Sets this window's title
     */
    setTitle(error, message) {
        const data = message.data
        // Update the window titler whenever the name input is updated
        // in the composites designer component
        FSBL.Clients.WindowClient.setWindowTitle(!data.name ? 
            this.state.compositeName : data.name)
    }
    /**
     * Closes the canvas window
     */
    closeWindow() {
        FSBL.Clients.WindowClient.close()
    }

    render() {
        return <div id="canvas">
           {!this.state.components.length && <h1>Drag apps from the left into this area</h1>}
        </div>
    }
}