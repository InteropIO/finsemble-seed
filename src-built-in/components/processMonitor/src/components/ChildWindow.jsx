import React from "react";
import { Store, Actions } from "../stores/ProcessMonitorStore";
//Not used right now. Currently using alerts. This is for the future.
export default class ChildWindow extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className="child-window">
                <div className="child-window-actions">
                    <i className="close-window ff-close" onClick={() => {
                        Actions.closeWindow(this.props.cw);
                    }}
                    ></i>
                </div>
                {this.props.cw.name}
            </div >
        )
    }
}