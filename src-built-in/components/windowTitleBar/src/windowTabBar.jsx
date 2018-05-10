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

FSBL.addEventListener("onReady", function () {
	storeExports.initialize(function () {
		HeaderActions = storeExports.Actions;
		windowTitleBarStore = storeExports.getStore();
		ReactDOM.render(<WindowTabBar />, document.getElementById("FSBLHeader"));
	});
});