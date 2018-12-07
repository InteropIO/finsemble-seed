import React from 'react'
import Search from './Search'
import AppsList from './AppsList'
import SaveOrCancel from './SaveOrCancel'

const COMPOSITES_CANVAS_COMPONENT = 'Composites Canvas'
let canvasWindow  = null
/**
 * The left side of the composites designer.
 * This displays a list of apps that can be grabbed
 * with mouse and droped into the canvas.
 */
export default class App extends React.Component {

    constructor(props) {
        super(props)
        // Bind correct context
        this.closeCanvas = this.closeCanvas.bind(this)
    }
    
    componentDidMount() {
        // User might have clicked on edit composite instead of new
        // in that case, there are data passed {name, layout}
        // we need them to set the name in this component
        // and pass goldenlayout (layout) to canvas
        const data = FSBL.Clients.WindowClient.getSpawnData()
        const canvasSpawnData = data.name && data.layout ? data : {}
        // Launch the canvas once mounted
        FSBL.Clients.LauncherClient.spawn(COMPOSITES_CANVAS_COMPONENT, {
            data: canvasSpawnData
        }, (error, data) => {
            // Keep a reference to the fin window to close it later
            canvasWindow = data.finWindow
        })
    }
    /**
     * Closes the canvas window
     */
    closeCanvas() {
        canvasWindow.close()
    }
    render() {
        return <div>
            <Search />
            <AppsList />
            <SaveOrCancel onDone={this.closeCanvas}/>
        </div>
    }
}