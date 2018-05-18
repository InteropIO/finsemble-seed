

import React from "react";
import ReactDOM from "react-dom";
import Tab from "./tab";
import { FinsembleDnDContext, FinsembleDroppable } from '@chartiq/finsemble-react-controls';

export default class TabRegion extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tabs: props.tabs
        }
        this.toggleDrag = this.toggleDrag.bind(this);
        this.startDrag = this.startDrag.bind(this);
        this.stopDrag = this.stopDrag.bind(this);
        this.cancelTabbing = this.cancelTabbing.bind(this);
        this.clearDragEndTimeout = this.clearDragEndTimeout.bind(this);
        this.drop = this.drop.bind(this);
        this.dragOver = this.dragOver.bind(this);
        this.dragLeave = this.dragLeave.bind(this);

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
        let isInWindow = FSBL.Clients.WindowClient.isPointInBox(this.mousePositionOnDragEnd, FSBL.Clients.WindowClient.options);
        if (!isInWindow) {
            this.removeTab(this.extractWindowIdentifier(e));
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
    extractWindowIdentifier(e) {
        return e.dataTransfer.getData('text/json');
    }
    //Someone drops on our area.
    drop(e) {
        let identifier = this.extractWindowIdentifier(e);
        this.addTab(JSON.parse(identifier));
        this.setState({
            renderGhost: false
        })
    }
    componentWillReceiveProps(props) {
        this.setState({
            tabs: props.tabs
        })
    }
    //Replace with API call.
    addTab(identifier) {
        let exists = false;
        for (let i = 0; i < this.state.tabs.length; i++) {
            let tab = this.state.tabs[i];
            if (tab.windowName === identifier.windowName && tab.uuid === identifier.uuid) {
                exists = true;
            }
        }
        if (!exists) {
            let { tabs } = this.state;
            tabs.push(identifier);
            this.setState({ tabs })
        }
    }
    //Dummy code.
    removeTab(identifier) {
        let i = this.state.tabs.findIndex(el => el.name === identifier && el.uuid === identifier);
        let { tabs } = this.state;
        tabs.splice(i, 1);
        this.setState({ tabs });
    }

    dragOver(e) {
        e.preventDefault();
        this.setState({
            renderGhost: true
        });
    }
    dragLeave(e) {
        let boundingRect =this.refs.tabArea.getBoundingClientRect()
        if (!FSBL.Clients.WindowClient.isPointInBox({ x: e.screenX, y: e.screenY }, boundingRect)) {
            this.setState({
                renderGhost: false
            })
        }

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
            <div ref="tabArea" onDragLeave={this.dragLeave} onDragOver={this.dragOver} onDrop={this.drop} className={"fsbl-tab-area"} >
                {this.state.tabs.map((tab, i) => {
                    return <Tab key={i} draggable="true" onDragStart={(e) => {
                        this.startDrag(e, tab);
                    }}
                        onDragEnd={this.stopDrag}
                        tabWidth={this.props.tabWidth} title={tab.windowName}
                        onTabClose={() => {
                            this.removeTab(tab);
                        }}
                        windowIdentifier={JSON.stringify(tab)} />
                })}
                {this.state.renderGhost &&
                    <div draggable={true} className="fsbl-tab ghost-tab"></div>}
            </div>
        );
    }
}