import React from 'react'
import { getStore } from '../store'
/**
 * Renders a list of available components
 */
export default class AppsList extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            components: [],
            filter: ''
        }
        // Bind correct context
        this.setFilterText = this.setFilterText.bind(this)
    }

    componentWillMount() {
        // Subscribe to search input changes
        getStore().addListener({ field: 'filter' }, this.setFilterText)
        this.getComponents()
    }

    componentWillUnmount() {
        // Unsubscribe from search input changes
        getStore().removeListener({ field: 'filter' }, this.setFilterText)
    }

    /**
     * Retrieve all components using LauncherClient.getComponentList
     */
    getComponents() {
        const components = []
        // Get the full components list and filter it
        // to exlude system components
        FSBL.Clients.LauncherClient
            .getComponentList()
            .then((response) => {
                for (const key in response.data) {
                    const comp = response.data[key].component
                    if (comp.category !== 'system') {
                        components.push(key)
                    }
                }
                this.setState({ components })
            })
    }
    /**
     * 
     * @param {any} error The error if it exists
     * @param {onject} data The newly set value
     */
    setFilterText(error, data) {
        if (!error) {
            this.setState({
                filter: data.value
            })
        }
    }
    /**
     * Returns a list of filtered apps based on search text
     */
    filteredApps() {
        if (!this.state.filter) {
            return this.state.components
        }
        return this.state.components.filter((app) => {
            return app.toLowerCase()
                .indexOf(this.state.filter.toLowerCase()) > -1
        })
    }
    /**
     * Sets the data for the drag event
     * @param {object} event The drag event
     * @param {string} component The component name
     */
    onDragStart(event, component) {
        event.dataTransfer.effectAllowed = "copyMove"
        event.dataTransfer.setData("component", component)
    }

    render() {
        return <div id="apps">
            <ul>
                {this.filteredApps().map((item, index) => {
                    return <li key={index} onDragStart={(event) => {
                        this.onDragStart(event, item)
                    }} draggable="true">
                        <i className="ff-component"></i> <span>
                            {item}
                        </span>
                    </li>
                })}
            </ul>
        </div>
    }
}