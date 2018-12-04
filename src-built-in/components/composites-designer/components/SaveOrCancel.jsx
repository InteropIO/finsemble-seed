import React from 'react'
import { getStore } from '../store';
/**
 * Renders the Save/Cancel buttons and naming input
 */
export default class SaveOrCancel extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            name: ''
        }
        // Bind correct context
        this.onNameChange = this.onNameChange.bind(this)
        this.onCancelClick = this.onCancelClick.bind(this)
    }
    /**
     * Called when the name input value changes
     * @param {object} event The name change event
     */
    onNameChange(event) {
        this.setState({
            name: event.target.value
        })
        // Notify the canvas about this change
        FSBL.Clients.RouterClient.transmit("composites:name", {
            name: event.target.value
        })
    }
    /**
     * Called when user clicks on "Cancel" button
     */
    onCancelClick() {
        // Let the main component know that we're done
        // to perform some actions like closing the canvas etc
        this.props.onDone()
        // And close this window
        FSBL.Clients.WindowClient.close()
    }

    render() {
        return <div id="save">
            <div>
                <span>Save As:</span> 
                <input onChange={this.onNameChange} className="input-name" />
            </div>
            <div className="buttons">
                <button onClick={this.onCancelClick}>Cancel</button>
                <button className="save-btn" disabled={!this.state.name}>Save</button>
            </div>
        </div>
    }
}