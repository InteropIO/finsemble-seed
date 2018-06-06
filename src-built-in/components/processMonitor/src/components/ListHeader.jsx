import React from "react";
import { Store, Actions } from "../stores/ProcessMonitorStore";
//Not used right now. Currently using alerts. This is for the future.
export default class ListHeader extends React.Component {
    constructor(props) {
        super(props);

    }
    render() {
        //Just a list of the things beneath it. name, CPU, mem, etc. drive from store.
        return <div className="list-header">
            <div className="list-header-statistic-label list-header-name">
                Name
            </div>
            <div className="list-header-statistic-labels">
                {this.props.fields.map(field => {
                    return (<div className="list-header-statistic-label">
                        {field.label}
                    </div>)
                })}
                <div className="list-header-statistic-label"></div>
            </div>
        </div>
    }
}