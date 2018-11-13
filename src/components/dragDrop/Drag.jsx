import React from "react";
import "./dragDrop.css";

// FSBL.addEventListener("onReady", function () {
export default class Drag extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            moving: 0
        }
    }
    mouseup = () => {
        console.log('mouseUp:', this.target)
        window.removeEventListener('mousemove', this.divMove, true);
    }
    mousedown = () => {
        console.log('mousedown:', this.target)
        window.addEventListener('mousemove', this.divMove, true);
    }
    divMove = (e) => {
        console.log('divmove:', e.target)
        var div = document.getElementById(this.state.moving);
        div.style.position = 'absolute';
        div.style.top = e.clientY + 'px';
        div.style.left = e.clientX + 'px';
    }
    componentDidMount = () => {
        console.log('mounting')
        var div = document.getElementById('0')

        div.addEventListener('mousedown', this.mousedown, true)
        window.addEventListener('mouseup', this.mouseup, true)
    }
    render() {
        return (
            <div className="container">
                <ul>
                    <li>
                        <a>
                            <i className="fa fa-plus" aria-hidden="true" />
                        </a>
                    </li>
                </ul>
                <div className="droppable" id='0' >test</div>
            </div>
        );
    }
}
