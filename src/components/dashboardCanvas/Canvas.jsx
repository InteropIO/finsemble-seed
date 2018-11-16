import React from "react";
import "./dashboardCanvas.css";
var log = console.log;
var error = console.error
// FSBL.addEventListener("onReady", function () {

export default class Canvas extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            divs: [],
            moving: -1
        };
    }
    addListeners = () => {
        for (let index = 0; index < this.state.divs.length; index++) {
            document.getElementById(`${this.state.divs[index]}`).addEventListener('mousedown', this.mousedown, false)
            window.addEventListener('mouseup', this.mouseup, false)
        };
    }
    removeDiv = (e) => {
        console.log('typeof:', typeof e.target.id)
        let removeDivs = this.state.divs
        console.log(removeDivs)
        let loc = removeDivs.indexOf(parseInt(e.target.id))
        removeDivs.splice(loc, 1)
        this.setState({ divs: removeDivs })
    }
    getDivs = () => {

        const droppable = {
            width: "100vw",
            height: "100vw",
            border: "1px dotted #7f8082",
            borderRadius: "3px",
            padding: "0.5rem",
            resize: "both",
            overflow: "auto",
            backgroundColor: 'red'
        }



        let divs = [];
        for (var ii = 0; ii < this.state.divs.length; ii++) {
            divs.push(
                <div className="droppable" style={droppable} id={this.state.divs[ii] + "header"} key={ii + 1}  >
                    <div id={this.state.divs[ii]} key={ii + 2} className="myDivHeader type2">
                        Drag Here
                    </div>
                    <div onClick={this.removeDiv} >
                        <i className="fa fa-times" aria-hidden="true" id={this.state.divs[ii]}></i>
                    </div>
                    <div>
                        {this.state.divs[ii]}
                    </div>
                </div>
            )
        }
        setTimeout(this.addListeners, 1);

        return divs;
    };

    // addDiv = (e) => {
    // console.log(e.target.id)
    // var newValue = this.e5state.divs++;
    // newValue = newValue + 1;
    // this.setState({ divs: newValue });

    // };
    // drop = event => {
    //     event.preventDefault();
    //     const data = event.dataTransfer.getData("id");
    //     const element = document.getElementById(event.target.id);
    //     event.currentTarget.style.background = "white";
    //     try {
    //         event.target.appendChild(element);
    //     } catch (error) {
    //         console.warn("you can't move the item to the same place");
    //     }
    // };
    // mouseup = () => {
    //     window.removeEventListener('mousemove', this.divMove, true)
    // };

    // mousedown = (e) => {
    //     console.log('mouse down:', e.target.id)
    //     this.setState({ moving: e.target.id + "header" })
    //     window.addEventListener('mousemove', this.divMove, true);
    // }
    // divMove = (e) => {
    //     var div = document.getElementById(this.state.moving)
    //     div.style.position = 'absolute';
    //     div.style.top = e.clientY + 'px';
    //     div.style.left = e.clientX + 'px';
    // }
    onDrop = (ev) => {
        let id = ev.dataTransfer.getData('text')
        let arrayOfIds = this.state.divs;
        if (arrayOfIds.includes(parseInt(id)) === false && !isNaN(id)) {
            arrayOfIds.push(parseInt(id))
            this.setState({ divs: arrayOfIds })
        }
    }


    render() {
        return (
            <div className="div" onDrop={e => this.onDrop(e)} >
                {/* <ul>
                    <li>
                        <a onClick={this.addDiv}>
                            <i className="fa fa-plus" aria-hidden="true" />
                        </a>
                    </li>
                </ul> */}
                {this.getDivs()}
            </div>
        );
    }
}

// })