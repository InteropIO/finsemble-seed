

import React from "react";
import ReactDOM from "react-dom";
import Tab from "./tab";
import HoverDetector from "../HoverDetector.jsx";
import { FinsembleDnDContext, FinsembleDroppable } from '@chartiq/finsemble-react-controls';
import { Store, Actions } from "../../stores/windowTitleBarStore";
import { debug } from "util";
const PLACEHOLDER_TAB = {
    windowName: "",
    uuid: "",
    componentType: "placeholder-tab"
};
let TAB_WIDTH = 300;
const MINIMUM_TAB_SIZE = 60;

export default class TabRegion extends React.Component {
    constructor(props) {
        super(props);
        let initialState = Store.getValues(["activeTab", "tabs"]);
        this.state = {
            translateX: 0,
            tabs: initialState.tabs,
            activeTab: FSBL.Clients.WindowClient.getWindowIdentifier(),
            boundingBox: {},
            iAmDragging: false,
            hoverState: false
        };
        this.bindCorrectContext();
    }

    /**
     * Make sure that _this_ is correct inside of our event handlers.
     */
    bindCorrectContext() {
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
        this.findTabIndex = this.findTabIndex.bind(this);
        this.setActiveTab = this.setActiveTab.bind(this);
        this.onTabAdded = this.onTabAdded.bind(this);
        this.onTabClosed = this.onTabClosed.bind(this);
        this.setActiveTab = this.setActiveTab.bind(this);
        this.onStoreChanged = this.onStoreChanged.bind(this);
        // this.onActiveTabChanged = this.onActiveTabChanged.bind(this);
        this.onTabsChanged = this.onTabsChanged.bind(this);
        this.onTabDraggedOver = this.onTabDraggedOver.bind(this);
        this.isTabRegionOverflowing = this.isTabRegionOverflowing.bind(this);
        this.onWindowResize = this.onWindowResize.bind(this);
        this.getTabWidth = this.getTabWidth.bind(this);

    }
    getTabWidth(params = {}) {

        let { boundingBox, tabList } = params;
        if (typeof (tabList) === "undefined") {
            tabList = this.state.tabs;
        }
        if (typeof (boundingBox) === "undefined") {
            boundingBox = this.state.boundingBox;
        }
        if (typeof (boundingBox.right) === "undefined") {
            return TAB_WIDTH;
        }
        let containerWidth = boundingBox.right - boundingBox.left;
        let newTabWidth = (containerWidth / tabList.length);
        //Don't let them stay super big when dragging around.
        if (this.props.listenForDragOver && newTabWidth > TAB_WIDTH) return TAB_WIDTH;

        return newTabWidth < MINIMUM_TAB_SIZE ? MINIMUM_TAB_SIZE : newTabWidth;
    }
    /**
 * Resize handler. Calculates the space that the center-region is taking up. May be used to scale tabs proportionally.
 */
    onWindowResize() {
        let bounds = this.refs.Me.getBoundingClientRect();
        this.setState({
            boundingBox: bounds,
            tabWidth: this.getTabWidth()
        })
    }
    findTabIndex(tab) {
        return this.state.tabs.findIndex(el => {
            return tab.windowName === el.windowName && tab.uuid === el.uuid;
        });
    }
	/**
     *
	 * Function that's called when this component fires the onDragStart event, this will start the tiling or tabbing process
	 *
	 * @param e The SyntheticEvent created by React when the startdrag event is called
	 * @memberof windowTitleBar
	 */
    startDrag(e, windowIdentifier) {
        FSBL.Clients.Logger.system.debug("Tab drag start", windowIdentifier.windowName);
        console.log("start drag", windowIdentifier.windowName);
        this.setState({
            iAmDragging: true
        });
        e.dataTransfer.setData("text/json", JSON.stringify(windowIdentifier));
        FSBL.Clients.WindowClient.startTilingOrTabbing({
            windowIdentifier: windowIdentifier
        });
        // Actions.removeTab(windowIdentifier);
    }

	/**
	 * Called when the react component detects a drop (or stop drag, which is equivalent)
	 *
	 * @param e The SyntheticEvent created by React when the stopdrag event is called
	 * @memberof windowTitleBar
	 */
    stopDrag(e) {
        FSBL.Clients.Logger.system.debug("Tab drag stop");
        //@sidd can you document this?
        this.mousePositionOnDragEnd = {
            x: e.nativeEvent.screenX,
            y: e.nativeEvent.screenY
        }
        this.dragEndTimeout = setTimeout(this.clearDragEndTimeout, 300);
        FSBL.Clients.RouterClient.addListener('tabbingDragEnd', this.clearDragEndTimeout);

    }

    /**
     * @todo @sidd, can you document this?
     * @param {event} err
     * @param {*} response
     */
    clearDragEndTimeout(err, response) {
        FSBL.Clients.Logger.system.debug("Clear Drag end timeout.");

        clearTimeout(this.dragEndTimeout);
        if (!response) {
            FSBL.Clients.Logger.system.debug("Clear Drag end timeout. Stopping tiling.");
            console.log("DRAG END TIMEOUT NO RESPONSE")
            FSBL.Clients.WindowClient.stopTilingOrTabbing({ mousePosition: this.mousePositionOnDragEnd });
            this.onWindowResize();
        } else {
            console.log("DRAG END TIMEOUT GOT RESPONSE")
        }
        FSBL.Clients.RouterClient.removeListener('tabbingDragEnd', this.clearDragEndTimeout);
        this.setState({
            iAmDragging: false
        });
    }

    /**
     * Helper function that will pull data from a drop event, parse it, and return it.
     * @param {event} e
     */
    extractWindowIdentifier(e) {
        try {
            let identifier = JSON.parse(e.dataTransfer.getData('text/json'));
            //If the "identifier" is formed properly, it'll have this properly. Otherwise, it's something else (e.g., share data, image, etc).
            if (typeof identifier.windowName !== "undefined") {
                return identifier;
            } else {
                FSBL.Clients.Logger.system.error("Malformed drop object detected in windowTitleBar. Check tab droppping code. Expected windowIdentifier, got ", identifier);
                return null;
            }
        } catch (e) {
            FSBL.Clients.Logger.system.error("Error in 'extractWindowIdentifier'. Check TabRegion.jsx. Either there was no data in the event, or it was a circular object that caused JSON.parse to fail. Javascript Error:", e);
            return null;
        }
    }
    /**
     * Called when a drop event occurs on the tab region. We (hope) that this came from a tab. Could be a share icon, an image, something else - that's why we check to see if the identifier exists before doing anything.
     * @param {event} e
     */
    drop(e) {

        FSBL.Clients.Logger.system.debug("Tab drag drop.");
        let identifier = this.extractWindowIdentifier(e);
        if (identifier) {
            console.log("DROP", identifier);
            //Calls a method defined inside of windowTitleBar.jsx.
            this.onTabAdded(identifier);
        } else {
            FSBL.Clients.Logger.system.error("Unexpected drop event on window title bar. Check the 'drop' method on TabRegion.jsx.");
        }
        FSBL.Clients.RouterClient.transmit("tabbingDragEnd", { success: true });
        FSBL.Clients.WindowClient.stopTilingOrTabbing({ allowDropOnSelf: true, action: "tabbing" });
        this.props.onTabDropped();
    }

    isTabRegionOverflowing() {
        let lastTab = {
            right: this.state.tabs.length * this.state.tabWidth
        };
        return lastTab.right + this.state.translateX > (this.props.boundingBox.right - this.props.boundingBox.left);
    }

    /**
     * Event handler for when a user wheels inside of the tab region. We translate the deltaY that the event provides into horizontal movement. The translateX value that we return will be used in the render method below.
     * @param {event} e
     */
    onMouseWheel(e) {
        e.preventDefault();
        let numTabs = this.state.tabs.length;
        let translateX = 0;
        //If there's more than one tab, do some calculations, otherwise we aren't going to scroll this region, no matter how much the user wants us to.
        if (numTabs > 1) {
            let currentX = this.state.translateX;
            let { boundingBox } = this.props;
            //Figure out position of first tab and last tab.
            let firstTab = {
                left: 0 + boundingBox.left,
            };
            let lastTab = {
                right: numTabs * this.state.tabWidth
            };

            //If the content is overflowing, correct the translation (if necessary)..
            if (lastTab.right > boundingBox.right) {
                translateX = e.nativeEvent.deltaY + currentX;
                let maxRight = boundingBox.right - this.state.tabWidth;
                let newRightForLastTab = lastTab.right + translateX;
                let newLeftForFirstTab = firstTab.left + translateX;
                //Do not let the left of the first tab move to the right of the left edge of the bounding box.
                if (newLeftForFirstTab >= boundingBox.left) {
                    return this.scrollToFirstTab();
                } else if (e.nativeEvent.deltaY < 0 && newRightForLastTab <= boundingBox.right) {
                    //ONLY IF the user is scrolling from right-to-left (deltaY will be negative). IF they try to do that, do not allow the right edge of the last tab to detach.
                    return this.scrollToLastTab();
                }
            }
            //Else, the translation is okay. We're in the middle of our list and the first and last tabs aren't being rendered improperly.
            this.setState({ translateX });
        }
    }
    /**
     * Scrolls to our active tab.
     */
    scrollToActiveTab() {
        this.scrollToTab(this.state.activeTab);
    }
    /**
     * Scrolls to the first tab in our list of tabs.
     */
    scrollToFirstTab() {
        let firstTab = this.state.tabs[0];
        this.scrollToTab(firstTab);
    }
    /**
     * Scrolls to the last tab in our list of tabs
     */
    scrollToLastTab() {
        let lastTab = this.state.tabs[this.state.tabs.length - 1];
        this.scrollToTab(lastTab);
    }
    /**
     * Function that will horiztonally scroll the tab region so that the right edge of the tab lines up with the right edge of the tab region.
     * @param {} tab
     */
    scrollToTab(tab) {
        //'BoundingBox' is just the boundingClientRect of the tab region. It is, in essence, the center part of the windowTitleBar.
        let boundingBox = this.props.boundingBox;

        let tabIndex = this.state.tabs.findIndex(el => {
            return el.windowName === tab.windowName && el.uuid === tab.uuid
        });
        if (tabIndex > -1) {
            let leftEdgeOfTab = tabIndex * this.state.tabWidth;
            let rightEdgeOfTab = leftEdgeOfTab + this.state.tabWidth;
            //Our translation is  this: Take the  right edge of the bounding box, and subract the left edge. This gives us the 0 point for the box. Then, we subtract the right edge of the tab. The result is a number that we use to shift the entire element and align the right edge of the tab with the right edge of the bounding box. We also account for the 30 px region on the right.
            let translateX = boundingBox.right - boundingBox.left - 30 - rightEdgeOfTab;

            //If there's no overflow, we don't scroll.
            if (rightEdgeOfTab < boundingBox.right) {
                translateX = 0;
            }
            this.setState({ translateX });
        }
    }
    /**
     * Someone is dragging _something_ over the tab region. We respond by rendering the ghost tab.
     * @param {event} e
     */
    dragOver(e) {
        // if (this.state.tabBeingDragged === null) {
        //     let identifier = PLACEHOLDER_TAB;
        //     this.setState({
        //         tabBeingDragged: identifier
        //     });
        // }
        console.log("Drag over the tab region");
        e.preventDefault();
        Actions.reorderTabLocally(PLACEHOLDER_TAB, this.state.tabs.length);
    }
    /**
     * Triggered when the user moves their mouse out of the tabRegion after a dragOver event happens. When they leave, we hide our placeholder tab.
     * @param {event} e
     */
    dragLeave(e) {
        let boundingRect = this.state.boundingBox;
        if (!FSBL.Clients.WindowClient.isPointInBox({ x: e.screenX, y: e.screenY }, boundingRect)) {
            Actions.removeTabLocally(PLACEHOLDER_TAB);
        }

    }
	/**
	 * Set to a timeout. An event is sent to the RouterClient which will be handled by the drop handler on the window.
	 * In the event that a drop handler never fires to stop tiling or tabbing, this will take care of it.
	 *
	 * @memberof windowTitleBar
	 */
    cancelTabbing() {
        FSBL.Clients.WindowClient.stopTilingOrTabbing({ allowDropOnSelf: true });
        this.onWindowResize();
    }
    /**
     * Basically exists just to keep the render method clean. Gives conditional classes to the active tab.
     * @param {tab} tab
     */
    getTabClasses(tab) {
        let classes = "fsbl-tab cq-no-drag"
        if (this.state.activeTab && tab.windowName === this.state.activeTab.windowName) {
            classes += " fsbl-active-tab";
        }
        if (tab.componentType === PLACEHOLDER_TAB.componentType) {
            classes += " ghost-tab";
        }
        return classes;
    }

    onTabDraggedOver(e, tabDraggedOver) {
        e.preventDefault();
        //Find index of tab.
        let tabIndex = this.findTabIndex(tabDraggedOver);
        console.log("Drag over a tab. new Index", tabIndex, tabDraggedOver.windowName);

        Actions.reorderTabLocally(PLACEHOLDER_TAB, tabIndex);
    }
    /**
	 * OnClick handler for the close button on individual tabs.
	 * @PLACEHOLDER will interact with tabbing API
	 * @param {*} tab
	 */
    onTabClosed(identifier) {

        Actions.closeTab(identifier);
    }
    /**
	 * drop handler for the tab region.
	 * @param {*} tab
	 */
    onTabAdded(identifier) {
        let newIndex = this.findTabIndex(PLACEHOLDER_TAB);
        //On drop, we hide our placeholder tab.
        Actions.removeTabLocally(PLACEHOLDER_TAB);
        //reorder will add if it doesn't exist.
        Actions.reorderTab(identifier, newIndex);
    }
    /**
	 * OnClick handler for individual tabs.
	 * @PLACEHOLDER will interact with tabbing API
	 * @param {*} tab
	 */
    setActiveTab(tab) {
        Actions.setActiveTab(tab);
    }

    onStoreChanged(prop, value) {
        this.setState({
            [prop]: value
        });
    }

    // onActiveTabChanged(err, response) {
    //     let { value } = response;
    //     this.onStoreChanged("activeTab", value);
    // }
    onTabsChanged(err, response) {
        let { value } = response;
        console.log("Tablist changed", value);
        this.setState({
            tabs: value,
            tabWidth: this.getTabWidth({ tabList: value })
        })
    }

    componentWillMount() {
        // Store.addListener({ field: "activeTab" }, this.onActiveTabChanged);
        Store.addListener({ field: "tabs" }, this.onTabsChanged);
    }

    componentDidMount() {
        window.addEventListener('resize', this.onWindowResize);
        let boundingBox = this.refs.Me.getBoundingClientRect();
        this.setState({
            boundingBox: boundingBox,
            tabWidth: this.getTabWidth({ boundingBox })
        })
    }

    componentWillUnmount() {
        // Store.removeListener({ field: "activeTab" }, this.onActiveTabChanged);
        Store.removeListener({ field: "tabs" }, this.onTabsChanged);
        window.removeEventListener('resize', this.onWindowResize);

    }
	hoverAction(newHoverState) {
		this.setState({ hoverState: newHoverState });
	}

    render() {
        let { translateX } = this.state;
        //If we have just 1 tab, we render the title. Unless someone is dragging a tab around - in that case, we will render the tab view, even though we only have 1.

        let componentToRender = "title";
        if (this.state.tabs.length === 1) {
            if (this.props.listenForDragOver && !this.state.iAmDragging) {
                componentToRender = "tabs";
            }
        }
        if (this.state.tabs.length > 1) {
            componentToRender = "tabs";
        }
        //Cleanup in case we were translated before closing the second to last tab. This left-aligns the title.
        if (componentToRender === "title") {
            translateX = 0;
        }
        //How far left or right to shift the tabRegion
        let tabRegionStyle = {
            marginLeft: `${translateX}px`
        }
        let tabRegionDropZoneStyle = { left: this.state.tabs.length * this.state.tabWidth + "px" }

        let moveAreaClasses = "cq-drag fsbl-tab-region-drag-area";
        if (this.isTabRegionOverflowing()) {
            moveAreaClasses += " gradient"
        }

        return (
            <div
                ref="Me"
                onDragLeave={this.dragLeave}
                className={this.props.className}
                onWheel={this.onMouseWheel}
                onScroll={this.onMouseWheel}
            >
                {/**This exists because I couldn't capture dragOver when simply changing the className on the tab-region wrapper. So instead, we render this div that sits absolutely positioned on top of the tabRegion.*/}
                {this.props.listenForDragOver &&
                    <div
                        style={tabRegionDropZoneStyle}
                        className="tab-drop-region"
                        onDrop={this.drop}
                        onDragOver={this.dragOver}
                    ></div>}
                <div className="tab-region-wrapper"
                    style={tabRegionStyle}
                >
                    {componentToRender === "title" && renderTitle()}
                    {componentToRender === "tabs" && renderTabs()}
                </div>

            </div>
        );
    }
}

/**
 * Function to render the title. Helps keep the render code clean.
 */
function renderTitle() {
    return (<div
        draggable="true"
        onDragStart={(e) => {
            this.startDrag(e, FSBL.Clients.WindowClient.getWindowIdentifier());
        }}
        onDragEnd={this.stopDrag}
        data-hover={this.state.hoverState}
        className={"fsbl-header-title cq-no-drag"}>
        <HoverDetector edge="top" hoverAction = {this.hoverAction.bind(this)} />
        <div className="fsbl-tab-logo"><i className="ff-grid"></i></div>
        {this.props.thisWindowsTitle}
    </div>);
}

/**
 * Renders the array of tabs.
 * @param {*} props
 */
function renderTabs() {
    return this.state.tabs.map((tab, i) => {
        return <Tab
            onClick={() => {
                this.setActiveTab(tab);
            }}
            draggable="true"
            key={i}
            className={this.getTabClasses(tab)}
            onDragStart={(e, identifier) => {
                this.startDrag(e, identifier);
            }}
            onDrop={this.drop}
            onDragEnd={this.stopDrag}
            onTabClose={() => {
                this.onTabClosed(tab)
            }}
            onTabDraggedOver={this.onTabDraggedOver}
            listenForDragOver={this.props.listenForDragOver}
            tabWidth={this.state.tabWidth}
            title={tab.windowName}
            windowIdentifier={tab} />
    });
}