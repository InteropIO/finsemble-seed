import React from 'react'
import GoldenLayout from 'golden-layout'
import 'golden-layout/src/css/goldenlayout-base.css'
import 'golden-layout/src/css/goldenlayout-dark-theme.css'

// Golden layout instance
let layout
/**
 * The canvas components, its where you drop apps in
 */
export default class Canvas extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            // The name to be displayed in window title
            compositeName: '',
            // Tells us whether we should display the instructions or not
            items: 0,
        }
        // Bind correct context
        this.onWindowResize = this.onWindowResize.bind(this)
        this.layoutStateChanged = this.layoutStateChanged.bind(this)
        this.closeWindow = this.closeWindow.bind(this)
        this.onDrop = this.onDrop.bind(this)
        this.onDrop = this.onDrop.bind(this)
    }
    componentWillMount() {
        // Subscribe to composites name input
        FSBL.Clients.RouterClient.addListener("composites:name", this.setTitle)
    }
    componentWillUnmount() {
        // Unsubscribe to composites name input
        FSBL.Clients.RouterClient.removeListener("composites:name", this.setTitle)
        // Remove resize listener
        window.removeEventListener("resize", this.onWindowResize)
    }
    componentDidMount() {
        const tilesElement = document.getElementById("tiles")
        layout = new GoldenLayout({
            dimensions: {
                // The gap between tiles
                borderWidth: 2
            },
            content: [{
                type: 'row',
                // content contains the grid tiles
                content: []
            }]
        }, tilesElement)
        // Keep updated about the layout state
        layout.on("stateChanged", this.layoutStateChanged)
        // Register our dummy component
        layout.registerComponent('tile', function () { })
        // Initialize layout, for some reason a delay is needed
        setTimeout(() => {
            layout.init()
        }, 100)
        // Resize layout when user resizes window
        window.addEventListener("resize", this.onWindowResize)
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
    /**
     * Triggered when app is dropped into canvas
     * @param {object} event The drop event object
     */
    onDrop(event) {
        event.preventDefault()
        // Add component to layout grid
        layout.root.contentItems[0].addChild({
            title: event.dataTransfer.getData("component"),
            type: 'component',
            componentName: 'tile',
        })
        // Update layout size
        this.onWindowResize()
    }
    /**
     * Shows a copy cursor when mouse is over the drop area
     * @param {object} event dragOver event
     */
    onDragOver(event) {
        event.dataTransfer.dropEffect = "copy"
    }
    /**
     * Called when canvas is resized
     */
    onWindowResize() {
        layout.updateSize()
    }
    /**
     * Called when a change was made to layout
     */
    layoutStateChanged() {
        this.setState({
            items: layout.root.contentItems.length
        })
    }
    render() {
        return <div id="canvas" onDrop={this.onDrop} onDragOver={this.onDragOver}>
            <div id="tiles"></div>
            {!this.state.items && <h1>Drag apps from the left into this area</h1>}
        </div>
    }
}