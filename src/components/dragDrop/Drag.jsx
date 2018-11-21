/***************************
* UserList Component
***************************/

import React, { Component } from 'react'

export default class Drag extends Component {
    constructor(props) {
        super(props)
        this.state = {
            config: {
                content: [{
                    type: 'row',
                    content: [
                    ]
                }]
            },
            myLayout: null
        }
    }
    componentDidMount = () => {
        var config = {
            content: [{
                type: 'row',
                content: []
            }]
        }
        try {
            var myLayout = new GoldenLayout(this.state.config)
            myLayout.init();
        } catch (e) {
            console.log('error right here:', e)
        }
        // myLayout.root.childElementContainer[0].onDrop = this.onDrop
        // myLayout.root.childeElementContainer[0].onDrop = this.onDrop
        // myLayout.childeNodes = this.onDrop
        this.setState({ myLayout })
    }
    onDestroy = () => {
        console.log('destroying')
    }
    onDrop = (ev) => {
        console.log('preAdd:', this.state.myLayout.root)
        let id = ev.dataTransfer.getData('text')

        let contentItems = this.state.myLayout.root.contentItems[0]
        let rerun = true
        var newItemConfig = {
            type: 'component',
            componentName: id,
            componentState: { text: id }
        };
        try {
            this.state.myLayout.registerComponent(id, function (container, state) {
                container.getElement().html('<h2>' + state.text + '</h2>');
            })
        } catch (e) {
            console.log(e)
        }
        this.state.myLayout.root.contentItems[0].addChild(newItemConfig)
        console.log('poastAdd:', this.state.myLayout.root)
    }

    render() {
        return (
            <div onDrop={e => this.onDrop(e)}>
                hello

            </div>
        )
    }
}
