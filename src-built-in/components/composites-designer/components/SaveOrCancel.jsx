import React from 'react'
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
        this.onSaveClick = this.onSaveClick.bind(this)
    }
    componentWillMount(){
        // If we are modifying a composite then there
        // will be data in spawnData, which has name and layout
        // we need the name to set the input value of name to the one
        // we are editing
        const spawnData = FSBL.Clients.WindowClient.getSpawnData()
        this.setState({
            name: spawnData.name || ''
        })
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
    /**
     * Called when user clicks on save, once this message is received by
     * canvas, Canvas will generate and save the composites JSON to persistent store
     */
    onSaveClick(){
        // Let the canvas know that we want to save
        FSBL.Clients.RouterClient.transmit("composites:save")
    }

    render() {
        return <div id="save">
            <div>
                <span>Save As:</span> 
                <input defaultValue={this.state.name} onChange={this.onNameChange} className="input-name" />
            </div>
            <div className="buttons">
                <button onClick={this.onCancelClick}>Cancel</button>
                <button onClick={this.onSaveClick} className="save-btn" disabled={!this.state.name}>Save</button>
            </div>
        </div>
    }
}