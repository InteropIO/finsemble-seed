/***************************
* UserList Component
***************************/

import React, { Component } from 'react'
const DEFAULT_CONFIG = {
    content: [
        {
            type: 'row',
            //isClosable prevents the default row from closing, which allows us to add components when the layout has nothing in it.
            isClosable: false,
            content: [
            ]
        }
    ]
};

export default class Drag extends Component {
    constructor(props) {
        super(props)
        this.state = {
            config: DEFAULT_CONFIG,
            myLayout: null,
            contentItems: null
        };
        this.onDrop = this.onDrop.bind(this);
    }

    componentDidMount = () => {
        try {
            var myLayout = new GoldenLayout(this.state.config)
            myLayout.init();
        } catch (e) {
            console.log('error right here:', e)
        }

        this.setState({ myLayout })
    }

    onDrop = (ev) => {
        console.log('preAdd:', this.state.myLayout.root)
        var RandomNumber = Math.random() * Math.floor(10000)
        //@todo make sure there's some text here.
        const componentType = ev.dataTransfer.getData('text');
        const id = componentType + RandomNumber;

        var newItemConfig = {
            type: 'component',
            componentName: id,
            componentState: { text: componentType }
        };

        this.state.myLayout.registerComponent(id, function (container, state) {
            container.getElement().html('<h2>' + state.text + '</h2>');
        })
        this.state.myLayout.root.contentItems[0].addChild(newItemConfig)
        console.log('poastAdd:', this.state.myLayout.root.contentItems[0])

    }

    render() {
        return (
            <div onDrop={this.onDrop}>
                hello
            </div >
        )
    }
}