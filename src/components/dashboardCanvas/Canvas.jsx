
import React, { Component } from 'react'
import { debug } from 'util';
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
            name: null,
            storageClient: null,
            divide: false,
            testing: true,
            layouts: [],
            divs: []
        };
        this.onDrop = this.onDrop.bind(this);
    }
    setLayouts = () => {
        let layouts = [];
        if (this.state.divide) {
            let numLayouts = this.state.divide ? 4 : 1
            for (var ii = 0; ii < this.state.divs.length; ii++) {
                console.log('divs:', this.state.divs[ii])
                let myLayout = new GoldenLayout(this.state.config, document.getElementById("dz" + ii))
                myLayout.init();
                myLayout.on('stateChanged', () => {
                    let GLState = myLayout.toConfig();
                    this.setState({ GLState });
                });
                FSBL.Clients.RouterClient.addListener("Save", function (error, response) {
                    if (error) {
                        console.log("Save Error: " + (error));
                    } else {
                        FSBL.Clients.WindowClient.setWindowTitle(`${response.data['DName']}`);
                    }
                });
                layouts.push(myLayout)
            }
            this.setState({ layouts })
        }
        if (!this.state.divide) {
            var myLayout = new GoldenLayout(this.state.config, document.getElementById('layoutContainer'))
            myLayout.init();
            myLayout.on('stateChanged', () => {
                let GLState = myLayout.toConfig();
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
        return layouts
    }
    componentDidMount = () => {

        this.setState({ divs: this.calculateDivs() }, () => this.setState({ layouts: this.setLayouts() }))
    }
    getJSON = () => {
        let name = this.state.name
        let state = this.state.GLState
        return {
            name: state
        }
    }
    onDrop = (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        //need this because you have to have unique names for registered components
        var RandomNumber = Math.random() * Math.floor(10000)
        //@todo make sure there's some text here.
        const componentType = ev.dataTransfer.getData('text');
        const id = `${componentType} ${RandomNumber}`;

        var newItemConfig = {
            type: 'component',
            componentName: id,
            componentState: { text: componentType }
        };
        if (this.state.divide) {
            //@todo needs comments. Why is this being done.
            let dropId = ev.target.closest(".dropzones").id;
            let dropZone = this.state.layouts.filter(dz => {
                return dz.container[0].id == dropId
            })[0];

            if (dropZone) {
                dropZone.registerComponent(id, function (container, state) {
                    container.getElement().html('<h2>' + state.text + '</h2>');
                })
                dropZone.root.contentItems[0].addChild(newItemConfig)
            }

        }
        if (!this.state.divide) {
            this.state.myLayout.registerComponent(id, function (container, state) {
                container.getElement().html('<h2>' + state.text + '</h2>');
            })
            this.state.myLayout.root.contentItems[0].addChild(newItemConfig)
        }
    }
    handleClick = (ev) => {
        if (ev.target.id == "divide") {
            this.setState({ divide: !this.state.divide },
                () => this.setState({ divs: this.calculateDivs() },
                    () => {
                        this.setState({ layouts: this.setLayouts() });
                    }))
        }
    }
    calculateDivs = () => {
        var divs = [];
        if (this.state.divide) {
            for (var ii = 0; this.state.divide ? ii < 4 : ii < 1; ii++) {
                divs.push(<div onDrop={this.onDrop} key={"dz" + ii} id={"dz" + ii} className="dropzones"></div>)
            }
        }
        if (!this.state.divide) {
            for (var ii = 0; this.state.divide ? ii < 4 : ii < 1; ii++) {
                divs.push(<div onDrop={this.onDrop} key={"dz" + ii} id="layoutContainer"></div>)
            }
        }
        return divs
    }
    render() {
        return (
            <div>
                <button className="divide" onClick={this.handleClick} id="divide">{this.state.divide ? 'Join' : 'Divide'}</button>
                {this.state.divs}
            </div>
        )
    }
}