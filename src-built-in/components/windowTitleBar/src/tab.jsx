import React from "react";
import ReactDOM from "react-dom";

export default class Tab extends React.Component{
	constructor(props) {
		super(props);
		
		this.bindCorrectContext();
	}

	/**
	 * Function to bind the 'this' property to the functions attached to the component
	 */
	bindCorrectContext() {
		this.startDrag = this.startDrag.bind(this);
		this.drop = this.drop.bind(this);
		this.stopDrag = this.stopDrag.bind(this);
		this.cancelTabbing = this.cancelTabbing.bind(this);
	}

	/**
	 * Function that's called when this component fires the onDragStart event, this will start the tiling or tabbing process
	 *
	 * @param e The SyntheticEvent created by React when the startdrag event is called
	 * @memberof windowTitleBar
	 */
	startDrag(e) {
		FSBL.Clients.WindowClient.startTilingOrTabbing({windowIdentifier: FSBL.Clients.WindowClient.getWindowIdentifier()});
	}

	/**
	 * Function to catch the drop event. This is called (along with dragEnd when the esc key is pressed)
	 * 
	 * @param {Object} e The SyntheticEvent created by React when the drop event is called 
	 */
	drop(e) {
		e.preventDefault();
		this.setState({
			dragEnded: true
		});
	}

	/**
	 * Called when the react component detects a drop (or stop drag, which is equivalent)
	 *
	 * @param e The SyntheticEvent created by React when the stopdrag event is called
	 * @memberof windowTitleBar
	 */
	stopDrag(e) {
		if (this.state.dragEnded != true) {
			//Esc was pressed
			this.setState({
				dragEnded: false
			}, () => {
				FSBL.Clients.WindowClient.cancelTilingOrTabbing();
			})
		}
		var timeout=setTimeout(this.cancelTiling, 6000);
		FSBL.Clients.RouterClient.transmit('tabbingDragEnd', {windowIdentifier: FSBL.Clients.WindowClient.getWindowIdentifier(), timeout: timeout});
	}

	/**
	 * Set to a timeout. An event is sent to the RouterClient which will be handled by the drop handler on the window.
	 * In the event that a drop handler never fires to stop tiling or tabbing, this will take care of it.
	 *
	 * @memberof windowTitleBar
	 */
	cancelTabbing() {
		FSBL.Clients.WindowClient.stopTilingOrTabbing();
	}

    render(){
		return (
			<div draggable={true} onDragStart={this.startDrag} onDragEnd={this.stopDrag} onDrop={this.drop} className={this.props.showTabs?"tab":"tab hidden"}>
				<div className="style">
					<svg id='Layer_1' data-name='Layer 1' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 176.49 20'>
						<polygon points='8.57 0.5 167.93 0.5 175.75 19.5 0.75 19.5 8.57 0.5' fill='#617383' stroke='#67829a' strokeMiterlimit='10' />
					</svg>
				</div>
				<div className="title">{this.props.title}</div>
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