import React from "react";
import "./dashboardCanvas.css";
var log = console.log;
export default class Canvas extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            divs: 0
        };
    }

    getDivs = () => {
        var divs = [];
        for (var ii = 0; ii < this.state.divs; ii++) {
            divs.push(
                <div className="droppable" onDragOver={this.allowDrop} onDrop={this.drop} data="hello" draggable key={ii} />
            );
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
        console.log(data);
        console.log(data);
        const element = document.getElementById(event.target.id);
        event.currentTarget.style.background = "white";
        try {
            event.target.appendChild(element);
        } catch (error) {
            console.warn("you can't move the item to the same place");
        }
    };
    render() {
        return (
            <div className="container">
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
