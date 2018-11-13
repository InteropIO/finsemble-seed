import React from "react";
import "./dashboardCanvas.css";
var log = console.log;
var error = console.error
// FSBL.addEventListener("onReady", function () {

export default class Canvas extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            divs: 1,
            moving: -1
        };
    }
    addListener = () => {
        console.log('here')
        for (var index = 0; index < this.state.divs; index++) {
            document.getElementById(`${index}`).addEventListener('mousedown', this.mousedown, false)
            window.addEventListener('mouseup', this.mouseup, false)
        };
    }
    getDivs = () => {
        var divs = [];
        for (var ii = 0; ii < this.state.divs; ii++) {
            divs.push(
                <div className="droppable" onLoad={this.addListener} onDragOver={this.allowDrop} onDrop={this.drop} data="hello" id={ii + "header"}  >
                    <div id={ii} key={ii} className="myDivHeader">
                        Drag Here
                        </div>
                </div >
            )
            document.getElementById(`${ii}header`).addEventListener('mousedown', this.mousedown, false)
            window.addEventListener('mouseup', this.mouseup, false)
        }

        return divs;
    };
    allowDrop = event => {
        event.preventDefault();
        event.currentTarget.style.background = "#7f8082";
    };
    addDiv = () => {
        var newValue = this.state.divs++;
        newValue = newValue + 1;
        this.setState({ divs: newValue });
    };
    drop = event => {
        event.preventDefault();
        const data = event.dataTransfer.getData("id");
        const element = document.getElementById(event.target.id);
        event.currentTarget.style.background = "white";
        try {
            event.target.appendChild(element);
        } catch (error) {
            console.warn("you can't move the item to the same place");
        }
    };
    mouseup = () => {
        console.log('on mouse up:', this.state.moving)
        window.removeEventListener('mousemove', this.divMove, true)
    };

    mousedown = (e) => {
        this.setState({ moving: e.target.id })
        console.log('on mouse down:', this.state.moving)
        window.addEventListener('mousemove', this.divMove, true);
    }
    divMove = (e) => {

        console.log(document.getElementById(this.state.moving + "header"))
        var div = document.getElementById(this.state.moving + "header")
        div.style.position = 'absolute';
        div.style.top = e.clientY + 'px';
        div.style.left = e.clientX + 'px';
    }
    componentDidMount = () => {
        this.setState({ divs: 1 })
        for (var index = 0; index < this.state.divs; index++) {
            document.getElementById(`${index}header`).addEventListener('mousedown', this.mousedown, false)
            window.addEventListener('mouseup', this.mouseup, false)
        };
    }
    componentWillUpdate = () => {

    }

    render() {
        return (
            <div className="div">
                <ul>
                    <li>
                        <a onClick={this.addDiv}>
                            <i className="fa fa-plus" aria-hidden="true" />
                        </a>
                    </li>
                </ul>
                {this.getDivs()}
            </div>
        );
    }
}

// })