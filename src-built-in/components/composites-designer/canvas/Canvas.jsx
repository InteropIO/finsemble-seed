import React from 'react'
import GoldenLayout from 'golden-layout'
import 'golden-layout/src/css/goldenlayout-base.css'
import 'golden-layout/src/css/goldenlayout-dark-theme.css'
import compositesJSON from '../utils/composites-json'
import storeActions from '../../composites-shared/store-actions'

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
        this.bindContext()
    }
    /**
     * Binds correct context
     */
    bindContext() {
        [
            'onWindowResize',
            'onCompositeSave',
            'layoutStateChanged',
            'closeWindow',
            'setTitle',
            'onDrop'].forEach((method) => {
                this[method] = this[method].bind(this)
            })
    }
    componentWillMount() {
        // Subscribe to composites name input
        FSBL.Clients.RouterClient.addListener("composites:name", this.setTitle)
        FSBL.Clients.RouterClient.addListener("composites:save", this.onCompositeSave)
        // Prepare store
        storeActions.prepareStore()
    }
    componentWillUnmount() {
        // Unsubscribe to composites name input
        FSBL.Clients.RouterClient.removeListener("composites:name", this.setTitle)
        FSBL.Clients.RouterClient.removeListener("composites:save", this.onCompositeSave)
        // Remove resize listener
        window.removeEventListener("resize", this.onWindowResize)
    }
    componentDidMount() {
        const tilesElement = document.getElementById("tiles")
        // If we are editing a composite, then layout is available
        // in spawn data and so we use it as a config for goldenlayout
        const spawnData = FSBL.Clients.WindowClient.getSpawnData()
        layout = new GoldenLayout(spawnData.layout || {
            settings: {
                constrainDragToContainer: false
            },
            dimensions: {
                // The gap between tiles
                borderWidth: 2,
                dragProxyWidth: 200,
                dragProxyHeight: 50
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
        this.setState({
            compositeName: data.name
        })
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
    /**
     * Triggered when user saves the composite, this function calls composites-json
     * module to take the layout stacks and convert them into a composite json
     * @param {any} error Error receiving message from RouterClient 
     * @param {object} message Transmited message after clicking on "Save"
     */
    async onCompositeSave(error, message) {
        const json = await compositesJSON.generate(
            this.state.compositeName,
            document.getElementsByClassName('lm_stack'))
        // We also need the goldenlayout config if we want to edit
        // this layout in the future
        json.layout = layout.toConfig()
        // Save to persistent store
        storeActions.addComposite(this.state.compositeName, json)
    }

    render() {
        return <div id="canvas" onDrop={this.onDrop} onDragOver={this.onDragOver}>
            <div id="tiles"></div>
            {!this.state.items && <h1>Drag apps from the left into this area</h1>}
        </div>
    }
}