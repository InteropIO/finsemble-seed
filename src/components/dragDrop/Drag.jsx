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
            myLayout: null,
            contentItems: null
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
    onDrop = (ev) => {
        console.log('preAdd:', this.state.myLayout.root)
        let id = ev.dataTransfer.getData('text')
        var RandomNumber = Math.random() * Math.floor(10000)
        let contentItems = this.state.myLayout.root.contentItems[0]
        let rerun = true
        var newItemConfig = {
            type: 'component',
            componentName: id + RandomNumber + "",
            componentState: { text: id }
        };
        // try {

        this.state.myLayout.registerComponent(id + RandomNumber + "", function (container, state) {
            container.getElement().html('<h2>' + state.text + '</h2>');
        })
        console.log(this.state.myLayout.root)
        this.state.myLayout.root.contentItems[0].addChild(newItemConfig)
        console.log('poastAdd:', this.state.myLayout.root.contentItems[0])
        console.log('\n\n\n\n\n')
    }

    render() {
        return (
            <div onDrop={e => this.onDrop(e)}>
                hello

            </div>
        )
    }
}
