import React from 'react'
import storeActions from '../composites-shared/store-actions'
import {
    FinsembleMenu,
    FinsembleMenuSection,
    FinsembleMenuItem,
    FinsembleMenuItemLabel
} from '@chartiq/finsemble-react-controls';

let store

export default class App extends React.Component {
    constructor() {
        super()
        this.state = {
            composites: {}
        }
        this.bindContext()
    }
    componentWillMount() {
        store = storeActions.getStore()
        store.addListener(this.onCompositesUpdate)
    }

    componentWillUnmount() {
        store.removeListener(this.onCompositesUpdate)
    }
    /**
     * Binds correct context to multiple methods
     */
    bindContext() {
        const methods = [
            'onEditClick',
            'onDeleteClick',
            'onCompositesUpdate',
            'onNewCompositeClick'
        ]
        methods.forEach((method) => {
            this[method] = this[method].bind(this)
        })
    }
    /**
     * Know when a composite is added or removed
     * and update our state
     */
    onCompositesUpdate(error, data) {
        if (!error) {
            this.setState({
                composites: data.value.values
            })
        }
    }
    onDeleteClick() {
    }
    onEditClick() {
    }
    onNewCompositeClick() {
    }

    render() {
        return (<FinsembleMenu className="composites-launcher-menu">
            {/*Options in the file menu.*/}
            <div>
                <FinsembleMenuSection className='menu-secondary'>
                    <FinsembleMenuItem>
                        <FinsembleMenuItemLabel onClick={this.onNewCompositeClick}>
                            <i className="ff-new-workspace"></i> New Composite
					</FinsembleMenuItemLabel>
                    </FinsembleMenuItem>
                </FinsembleMenuSection>
                <FinsembleMenuSection className='menu-primary'>
                    {
                        Object.keys(this.state.composites).map((itemName, index) => {
                            return <FinsembleMenuItem key={index}
                                isDeletable={true}
                                deleteAction={this.onDeleteClick}
                                pinIcon="ff-edit"
                                isPinned={false}
                                isPinnable={true}
                                pinAction={this.onEditClick}
                                label={itemName} />
                        })
                    }
                </FinsembleMenuSection>
            </div>
        </FinsembleMenu>)
    }
}