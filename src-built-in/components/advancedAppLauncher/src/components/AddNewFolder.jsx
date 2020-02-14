import React from 'react'
import storeActions from '../stores/StoreActions'

/**
 * A basic component that calls storeActions.addNewFolder()
 * to create a new folder in store. This component could be upgraded
 * to support inline naming of the new folder
 */
export default class AddNewFolder extends React.Component {
    constructor() {
        super()
    }

    addNewFolder() {
        storeActions.addNewFolder()
    }

    render() {
        return (<div onClick={this.addNewFolder}
            className='ff-plus-2 complex-menu-action'>
            New Folder
    </div>)
    }
}