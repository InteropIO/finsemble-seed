import React from 'react'
import storeActions from '../composites-shared/store-actions'
import compositesLauncher from './utils/composites-launcher'
import {
    FinsembleMenu,
    FinsembleMenuSection,
    FinsembleMenuItem,
    FinsembleMenuItemLabel
} from '@chartiq/finsemble-react-controls'

const COMPOSITE_DESIGNER_APP = "Composites Designer"
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
        FSBL.Clients.WindowClient.fitToDOM(
            {
                maxHeight: 500
            }, function () { });
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
            'onDeleteClick',
            'onCompositesUpdate',
            'onNewCompositeClick',
            'onCompositeClick'
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
            }, () => {
                FSBL.Clients.WindowClient.fitToDOM(
                    {
                        maxHeight: 500
                    }, function () { });
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
    /**
     * Launches the composites designer
     */
    onNewCompositeClick() {
        FSBL.Clients.LauncherClient.spawn(COMPOSITE_DESIGNER_APP, {})
    }
    /**
     * Spawns the composite designer and passes the composite's name
     * and composites layout (goldenlayout setting) in spawnData
     * @param {string} compositeName The composite name
     */
    onEditComposite(compositeName) {
        const compositeObject = this.state.composites[compositeName]
        FSBL.Clients.LauncherClient.spawn(COMPOSITE_DESIGNER_APP, {
            data: {
                layout: compositeObject.layout,
                name: compositeName
            }
        })
    }
    /**
     * Calls the compositeLauncher launch method to spawn
     * all components in the composite
     * @param {string} compositeName The composite name
     */
    onCompositeClick(compositeName) {
        compositesLauncher.launch(
            compositeName,
            this.state.composites[compositeName])
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
                                    onClick={() => this.onCompositeClick(itemName)}
                                    isDeletable={true}
                                    deleteAction={() => this.onDeleteClick(itemName)}
                                    pinIcon="ff-edit"
                                    isPinned={false}
                                    isPinnable={true}
                                    pinAction={() => this.onEditComposite(itemName)}
                                    label={itemName} />
                            })
                    }
                </FinsembleMenuSection>
            </div>
        </FinsembleMenu>)
    }
}