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
                {this.props.cw.name}
            </div>
        )
    }
}