import React from "react";
import { Store, Actions } from "../stores/ProcessMonitorStore";
//Not used right now. Currently using alerts. This is for the future.
export default class ChildWindow extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        let cwClickHandler = this.props.viewMode === "simple" ? Function.prototype : () => { Actions.identifyWindow(this.props.cw);}
        let childWindowClasses = `child-window ${this.props.viewMode}`
        return (
            <div className={childWindowClasses}>
                <div className="child-window-actions">
                    <i className="close-window ff-close" onClick={() => {
                        Actions.closeWindow(this.props.cw);
                    }}
                    ></i>
                </div>
                <div className="child-window-name" onClick={cwClickHandler}>
                    {this.props.cw.name}
                </div>
            </div >
        )
    }
}