

import React from "react";
import ReactDOM from "react-dom";
import Tab from "./tab";
export default class TabRegion extends React.Component {
    constructor(props) {
        super(props);
        this.toggleDrag = this.toggleDrag.bind(this);
		this.startDrag = this.startDrag.bind(this);
		this.stopDrag = this.stopDrag.bind(this);
		this.cancelTabbing = this.cancelTabbing.bind(this);
		this.clearDragEndTimeout = this.clearDragEndTimeout.bind(this);
    }

	/**
	 * Handles mouseover of title bar. This turns the regular title to a tab on windows that aren't already tabbing.
	 * This function is used as a prop on HoverDetector
	 *
	 * @memberof windowTitleBar
	 */
	toggleDrag() {
	}

	/**
	 * Function that's called when this component fires the onDragStart event, this will start the tiling or tabbing process
	 *
	 * @param e The SyntheticEvent created by React when the startdrag event is called
	 * @memberof windowTitleBar
	 */
	startDrag(e, windowIdentifier) {
		e.dataTransfer.setData("text/json", JSON.stringify(windowIdentifier));
		e.windowIdentifier = windowIdentifier;
		FSBL.Clients.WindowClient.startTilingOrTabbing({
			windowIdentifier: windowIdentifier
		});
	}

	/**
	 * Called when the react component detects a drop (or stop drag, which is equivalent)
	 *
	 * @param e The SyntheticEvent created by React when the stopdrag event is called
	 * @memberof windowTitleBar
	 */
	stopDrag(e) {
		this.mousePositionOnDragEnd = {
			x: e.nativeEvent.screenX,
			y: e.nativeEvent.screenY
		}
		this.dragEndTimeout = setTimeout(this.clearDragEndTimeout, 300);
		FSBL.Clients.RouterClient.addListener('tabbingDragEnd', this.clearDragEndTimeout);
	}

	clearDragEndTimeout(err, response) {
		clearTimeout(this.dragEndTimeout);
		if (!response) {
			FSBL.Clients.WindowClient.stopTilingOrTabbing({ mousePosition: this.mousePositionOnDragEnd });
			this.onWindowResize();
		}
		FSBL.Clients.RouterClient.removeListener('tabbingDragEnd', this.clearDragEndTimeout);
	}
	/**
	 * Set to a timeout. An event is sent to the RouterClient which will be handled by the drop handler on the window.
	 * In the event that a drop handler never fires to stop tiling or tabbing, this will take care of it.
	 *
	 * @memberof windowTitleBar
	 */
	cancelTabbing() {
		FSBL.Clients.WindowClient.stopTilingOrTabbing();
		this.onWindowResize();
	}
    render() {
        let titleWidth = this.props.tabWidth - 20;
        return (
            <div className={"fsbl-tab-area cq-no-drag"} draggable="true"
            >
                {this.props.tabs.map((tab, i) => {
                    return <Tab key={i} onDrop={this.drop} draggable="true" onDragStart={(e) => {
                        this.startDrag(e, tab);
                    }}
                        onDragEnd={this.stopDrag}
                        tabWidth={this.props.tabWidth} title={tab.windowName} />
                })}
            </div>
        );
    }
}