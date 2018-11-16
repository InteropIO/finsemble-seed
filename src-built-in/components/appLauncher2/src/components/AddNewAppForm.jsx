import React from 'react'
import storeActions from '../stores/StoreActions'
import {
    FinsembleDialogTextInput,
    FinsembleDialogButton
} from "@chartiq/finsemble-react-controls"

/**
 * A component that has a form to accept new app properties
 * like name, url and tags, validates user input then saves it
 * to persistent store. Showing or hiding this component is up to
 * parent component.
 * @example <AddNewAppForm onDone={this.someHandlerFunction}></AddNewAppForm>
 */
export default class AddNewAppForm extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            form: {
                name: '',
                tags: '',
                url: ''
            }
        }
        this.onSubmit = this.onSubmit.bind(this)
        this.onClear = this.onClear.bind(this)
        this.onCancel = this.onCancel.bind(this)
    }
    /**
     * Calls the storeActions.addApp() method
     * to save the new app in store.
     */
    onSubmit() {
        if( !/^[0-9a-zA-Z_.-\s]+$/.test(this.state.form.name) || 
            !/^\w(\s*,?\s*\w)*$/.test(this.state.form.tags) ||
            !/^(ftp|http|https):\/\/[^ "]+$/.test(this.state.form.url)) {
                console.warn('Invalid app name, tags or url.')
                return
        }
        storeActions.addApp(this.state.form, (error) => {
            // Notify parent if no errors
            !error && this.done()
        })   
    }
    /**
     * Clears all form inputs
     */
    onClear() {
        document.getElementById("new-app").reset()
    }
    /**
     * Just cancel and do not add the app
     */
    onCancel() {
        this.done()
    }
    /**
     * Calls the passed onDone property to let the parent component
     * know that we finished processing user's request (submit/cancel)
     */
    done() {
        if (this.props.onDone && typeof this.props.onDone === "function") {
            this.props.onDone()
            return
        }
        console.log('No onDone found in props.')
    }

    render() {
        const form = this.state.form
        return (<div className="add-app-form">
            <form id="new-app">
                <FinsembleDialogTextInput onInputChange={e => form.name = e.target.value} placeholder="App Name" autoFocus={true} />
                <FinsembleDialogTextInput onInputChange={e => form.url = e.target.value} placeholder="App URL" />
                <FinsembleDialogTextInput onInputChange={e => form.tags = e.target.value} placeholder="App Tags" />
                <div className="button-wrapper">
                    <FinsembleDialogButton className="fsbl-button-neutral" onClick={this.onClear}>
                        Clear
                </FinsembleDialogButton>
                    <FinsembleDialogButton className="fsbl-button-negative" onClick={this.onCancel}>
                        Cancel
                </FinsembleDialogButton>
                    <FinsembleDialogButton className="fsbl-button-affirmative" onClick={this.onSubmit}>
                        Submit
                </FinsembleDialogButton>
                </div>
            </form>
        </div>)
    }
}