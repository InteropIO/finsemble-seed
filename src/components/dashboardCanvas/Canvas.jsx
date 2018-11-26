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

export default class Canvas extends Component {
    constructor(props) {
        super(props)
        this.state = {
            config: DEFAULT_CONFIG,
            myLayout: null,
            GLState: null,
            name: null
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
        myLayout.on('stateChanged', () => {
            let GLState = myLayout.toConfig();
            console.log(GLState)
            this.setState({ GLState });
        });
        this.setState({ myLayout })
        FSBL.Clients.RouterClient.addListener("Save", function (error, response) {
            if (error) {
                console.log("Save Error: " + (error));
            } else {
                FSBL.Clients.WindowClient.setWindowTitle(`${response.data['DName']}`);
            }
        });

    }
    getJSON = () => {
        let name = this.state.name
        let state = this.state.GLState
        return {
            name: state
        }
    }
    onDrop = (ev) => {
        //need this because you have to have unique names for registered components
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

    }

    render() {
        return (
            <div onDrop={this.onDrop} >
                hello
            </div >
        )
    }
}