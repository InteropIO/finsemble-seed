

import React from "react";
import ReactDOM from "react-dom";
import Tab from "./tab";
import { FinsembleDnDContext, FinsembleDroppable } from '@chartiq/finsemble-react-controls';

export default class TabRegion extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            listenForDragOver: false,
            translateX: 0,
            renderGhost: false
        };
        this.startDrag = this.startDrag.bind(this);
        this.stopDrag = this.stopDrag.bind(this);
        this.cancelTabbing = this.cancelTabbing.bind(this);
        this.clearDragEndTimeout = this.clearDragEndTimeout.bind(this);
        this.drop = this.drop.bind(this);
        this.dragOver = this.dragOver.bind(this);
        this.dragLeave = this.dragLeave.bind(this);
        this.onMouseWheel = this.onMouseWheel.bind(this);
        renderTitle = renderTitle.bind(this);
        renderTabs = renderTabs.bind(this);
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
            // this.removeTab(this.extractWindowIdentifier(e));
        }
        this.dragEndTimeout = setTimeout(this.clearDragEndTimeout, 300);
        FSBL.Clients.RouterClient.addListener('tabbingDragEnd', this.clearDragEndTimeout);
    }

    clearDragEndTimeout(err, response) {
        clearTimeout(this.dragEndTimeout);
        if (!response) {
            FSBL.Clients.WindowClient.stopTilingOrTabbing({ mousePosition: this.mousePositionOnDragEnd });
            this.props.onWindowResize();
        }
        FSBL.Clients.RouterClient.removeListener('tabbingDragEnd', this.clearDragEndTimeout);
    }
    extractWindowIdentifier(e) {
        return JSON.parse(e.dataTransfer.getData('text/json'));
    }
    //Someone drops on our area.
    drop(e) {
        let identifier = this.extractWindowIdentifier(e);
        this.setState({
            renderGhost: false
        })
        this.props.onTabAdded(identifier)

    }
    componentWillReceiveProps(props) {
        console.log("GOT PROPS", props);
        this.setState({
            tabs: props.tabs,
            listenForDragOver: props.listenForDragOver
        })
    }
    //Replace with API call.
    addTab(identifier) {
        let exists = false;
        for (let i = 0; i < this.props.tabs.length; i++) {
            let tab = this.props.tabs[i];
            if (tab.windowName === identifier.windowName && tab.uuid === identifier.uuid) {
                exists = true;
            }
        }
        if (!exists) {
            let { tabs } = this.state;
            this.props.onTabAdded(identifier);
        }
    }


    dragOver(e) {
        console.log("DRAG OVER!!")
        e.preventDefault();
        this.setState({
            renderGhost: true
        });
    }

    dragLeave(e) {
        let boundingRect = this.refs.tabArea.getBoundingClientRect()
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
        this.props.onWindowResize();
    }
    getTabClasses(tab) {
        let classes = "fsbl-tab cq-no-drag"
        if (this.props.activeTab && tab.windowName === this.props.activeTab.windowName) {
            classes += " fsbl-active-tab";
        } else {
            if (tab.windowName === FSBL.Clients.WindowClient.windowName) {
                classes += " fsbl-active-tab";
            }
        }
        return classes;
    }
    onMouseWheel(e) {
        e.preventDefault();
        let numTabs = this.props.tabs.length;
        let translateX = 0;
        if (numTabs > 1) {
            let currentX = this.state.translateX;
            let { boundingBox } = this.props;
            //Figure out position of first tab and last tab.

            let firstTab = {
                left: 0,
            };
            let lastTab = {
                right: numTabs * this.props.tabWidth
            };
            //If the content is overflowing, correct the translation (if necessary)..
            if (lastTab.right > boundingBox.right) {
                translateX = e.nativeEvent.deltaY + currentX;
                let maxRight = boundingBox.right - this.props.tabWidth;
                let newRightForLastTab = lastTab.right + translateX;
                let newLeftForFirstTab = firstTab.left + translateX;
                //Do not let the left of the first tab move off of the left edge of the bounding box.
                if (newLeftForFirstTab >= boundingBox.left) {
                    translateX = 0;
                } else if (newRightForLastTab <= boundingBox.right) {
                    //Do not let the right edge of the last tab move off of the boundingBox's right edge
                    //Calculate the containerWidth, and subtract it from the right edge of the bounding box. Add a pixel for each tab to account for the right borders.
                    let containerWidth = numTabs * this.props.tabWidth + (numTabs);
                    translateX = boundingBox.right - containerWidth;
                }
                //Else, the translation is okay. We're in the middle of our list.
            }

        }

        console.log("TRANSLATION", translateX);
        this.setState({ translateX });
    }
    render() {
        let { translateX } = this.state;
        let componentToRender = (!this.props.listenForDragOver &&this.props.tabs.length === 1) ? "title" : "tabs";
        if (componentToRender === "title") {
            translateX = 0;
        }
        let style = {
            marginLeft: `${translateX}px`
        }
        return (
            <div ref="tabArea"
                onDragLeave={this.dragLeave}
                /**onDragover is this way because I had to trick react into re-rendering. Otherwise the dragOver wasn't firing (because cq-drag was on the component when it first rendered) */
                className={this.props.className}
                onWheel={this.onMouseWheel}
            >
                <div className="tab-region-wrapper"
                    style={style}
                >
                    {this.props.listenForDragOver &&
                        <div className="tab-drop-region"
                            onDrop={this.drop}
                            onDragOver={this.dragOver}
                        ></div>}
                    {componentToRender === "title" && renderTitle(this.props)}
                    {componentToRender === "tabs" && renderTabs(this.props)}
                    {this.state.renderGhost &&
                        <div className="fsbl-tab ghost-tab"></div>}
                </div>

            </div>
        );
    }
}

function renderTitle(props) {
    let identifier = FSBL.Clients.WindowClient.getWindowIdentifier();
    return (<div
        draggable="true"
        onDragStart={(e) => {
            this.startDrag(e, identifier);
        }}
        onDragEnd={this.stopDrag}
        className={"fsbl-header-title cq-no-drag"}> {props.thisWindowsTitle}</div>);
}

function renderTabs(props) {
    return props.tabs.map((tab, i) => {
        return <Tab
            onClick={() => {
                this.props.setActiveTab(tab);
            }}
            draggable="true"
            key={i}
            className={this.getTabClasses(tab)}
            onDragStart={(e) => {
                this.startDrag(e, tab);
            }}
            onDragEnd={this.stopDrag}
            onTabClose={() => {
                this.props.onTabClosed(tab)
            }}
            tabWidth={this.props.tabWidth}
            title={tab.windowName}
            windowIdentifier={JSON.stringify(tab)} />
    })
}