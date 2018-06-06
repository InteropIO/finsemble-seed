import React from "react";
import { Store, Actions } from "../stores/ProcessMonitorStore";
import ChildWindow from "./ChildWindow";
//Not used right now. Currently using alerts. This is for the future.
export default class ChildWindows extends React.Component {
    constructor(props) {
        super(props);

    }
    render() {
        //Array of childWindow components.
        return <div>
            {this.props.childWindows.map(cw => {
                return (<ChildWindow cw={cw} />)
            })}

        </div>
    }
}