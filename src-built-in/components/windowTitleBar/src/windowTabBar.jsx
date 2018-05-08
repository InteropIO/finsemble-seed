import WindowTitleBar from './windowTitleBar.jsx'

class WindowTabBar extends WindowTitleBar {
	constructor(props) {
        super(props);
    }
    toggleToTitle() {
		
	}
    render(){
        return(<div className="fsbl-header" onMouseLeave={this.toggleToTitle}>
        <div className="fsbl-header-left">
            {self.state.showLinkerButton ? <Linker /> : null}
            <Sharer />
        </div>
        <div className="fsbl-header-center cq-drag"><div className="header-title header-title-tab cq-no-drag">{self.state.windowTitle}</div></div>
        <div onMouseDown={this.startLongHoldTimer} className="fsbl-header-right">
            <BringSuiteToFront />
            {this.state.minButton && showMinimizeIcon ? <Minimize /> : null}
            {showDockingIcon ? <DockingButton /> : null}
            {this.state.maxButton ? <Maximize /> : null}
            {this.state.closeButton ? <Close /> : null}

        </div>
    </div>);
    }
}

function dragElement(elmnts) {
    let pos1 = 0, pos2 = 0;
    for (let i = 0; i < elmnts.length; i++) {
        elmnts[i].onmousedown = dragMouseDown;
        elmnts[i].parentNode.onmouseenter = mouseEnterTransition;
        elmnts[i].parentNode.onmouseleave = mouseLeaveTransition;
    }

    function mouseEnterTransition(e){
        console.log(e.target);
        var clonedTab = e.target.children[0].cloneNode(true);
        clonedTab.className+=" header-title-hover";
        e.target.parentNode.insertBefore(clonedTab, null);
    }

    function mouseLeaveTransition(e){
        console.log(e.target.children);
        e.target.children[1].remove();
    }

    function dragMouseDown(e) {
        e = e || window.event;
        // get the mouse cursor position at startup:
        pos2 = e.clientX;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        // calculate the new cursor position:
        pos1 = pos2 - e.clientX;
        pos2 = e.clientX;
        // set the element's new position:
        e.target.style.left = (e.target.offsetLeft - pos1) + "px";
        if (e.target.style.left <= "0px") {
            // emit the tear out event
        }
    }

    function closeDragElement(e) {
        /* stop moving when mouse button is released:*/
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

FSBL.addEventListener("onReady", function () {
	storeExports.initialize(function () {
		HeaderActions = storeExports.Actions;
		windowTitleBarStore = storeExports.getStore();
		ReactDOM.render(<WindowTabBar />, document.getElementById("FSBLHeader"));
		dragElement(document.getElementsByClassName("header-title"));
	});
});