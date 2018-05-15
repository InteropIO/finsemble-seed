import React from "react";
import ReactDOM from "react-dom";

export default class Tab extends React.Component{
	constructor(props) {
		super(props);
	}

    render(){
		let titleWidth=this.props.tabWidth-20;
		return (
			<div className="fsbl-tab">
				<div className="fsbl-tab-style" style={{width:(this.props.tabWidth-25) + 'px'}}>
					<svg id='Layer_1' data-name='Layer 1' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 175 25' width="100%" height="100%" preserveAspectRatio="none">
						<polygon points='8.57,0.5 165.5,0.5 174.5,23.5 0.25,23.5 8.57,0.5' fill='#617383' stroke='#67829a' strokeMiterlimit='10' />
					</svg>
				</div>
				<div className="fsbl-title" style={{width:titleWidth-20 + 'px'}}>{this.props.title}</div>
        	</div>
		);
    }
}


//We'll come back to this when reordering a tab is a necessity
// function dragElement(elmnts) {
// 	let pos1 = 0, pos2 = 0;
// 	for (let i = 0; i < elmnts.length; i++) {
// 		elmnts[i].onmousedown = dragMouseDown;
// 	}

// 	function dragMouseDown(e) {
// 		e = e || window.event;
// 		// get the mouse cursor position at startup:
// 		pos2 = e.clientX;
// 		document.onmouseup = closeDragElement;
// 		// call a function whenever the cursor moves:
// 		document.onmousemove = elementDrag;
// 	}

// 	function elementDrag(e) {
// 		e = e || window.event;
// 		// calculate the new cursor position:
// 		pos1 = pos2 - e.clientX;
// 		pos2 = e.clientX;
// 		// set the element's new position:
// 		e.target.style.left = (e.target.offsetLeft - pos1) + "px";
// 		if (e.target.style.left <= "0px") {
// 			// emit the tear out event
// 		}
// 	}

// 	function closeDragElement(e) {
// 		/* stop moving when mouse button is released:*/
// 		document.onmouseup = null;
// 		document.onmousemove = null;
// 	}
// }

// FSBL.addEventListener("onReady", function () {
// 	dragElement(document.getElementsByClassName("tab"));
// });