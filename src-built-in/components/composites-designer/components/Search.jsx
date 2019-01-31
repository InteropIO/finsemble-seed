import React from 'react'
import {getStore} from '../store'
/**
 * Renders a search input
 */
export default class Search extends React.Component {
    constructor(props) {
        super(props)
        // Bind correct context
        this.onValueChange = this.onValueChange.bind(this)
    }
    /**
     * Called when user types something in search input.
     * We extract the typed value from event.target.value
     * @param {object} event The input change event
     */
    onValueChange(event) {
        getStore().setValue({
            field: 'filter',
            value: event.target.value
        })   
    }

    render() {
        return <div id="search">
            <input placeholder="Filter" onChange={this.onValueChange}/>
            <i className="icon ff-search"></i>
        </div>
    }
}