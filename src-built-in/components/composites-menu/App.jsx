import React from 'react'
import storeActions from '../composites-shared/store-actions'
import {
    FinsembleMenu,
    FinsembleMenuSection,
    FinsembleMenuItem,
    FinsembleMenuItemLabel
} from '@chartiq/finsemble-react-controls'

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
    /**
     * Calls store actions deleteComposite method
     * to delete a composite
     * @param {string} commpositeName The composite name to be deleted
     */
    onDeleteClick(commpositeName) {
        storeActions.deleteComposite(commpositeName)
    }
    onEditClick() {
    }
    onNewCompositeClick() {
    }

    render() {
        return (<FinsembleMenu className="composites-launcher-menu">
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
                        Object.keys(this.state.composites)
                        // @todo Revisit once StoreModel removeValue is reviewed
                        // Some composites have a null value and the reason is that
                        // StoreModel.removeValue() sets the field value to null
                        // and does not delete the field itself
                        .filter((composite) => this.state.composites[composite])
                        .map((itemName, index) => {
                            return <FinsembleMenuItem key={index}
                                isDeletable={true}
                                deleteAction={() => this.onDeleteClick(itemName)}
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