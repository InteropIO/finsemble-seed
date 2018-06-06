import React from "react";
import { Store, Actions } from "../stores/ProcessMonitorStore";
import { SIMPLE_MODE_STATISTICS, ADVANCED_MODE_STATISTICS } from "../constants";
import { bytesToSize, round } from "../helpers";
//Not used right now. Currently using alerts. This is for the future.
export default class ProcessStatistics extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        //simple mode: CPU, memory
        //Advanced mode: add more.
        //Use helpers.bytesToSize.
        return <div className="process-row">
            <div className="process-name">
                {this.props.mode === "simple" ? `Group ${this.props.groupModifier + 1}` : this.props.stats.name}
            </div>
            <div className="process-statistics">
                {this.props.fields.map(field => {
                    return (<div className="statistic">
                        {statistic(this.props.stats[field.value], field.label)}
                    </div>)
                })}
                <div className="statistic process-actions">
                        <div className="terminate process-action" onClick={() => {
                            Actions.terminateProcess(this.props.stats)
                        }}>
                    Terminate</div>
                </div>
            </div>
        </div>
    }
}

function statistic(number, statType) {
    if (statType === "CPU") {
        //make it a percent.
        return round(number, 2) + "%";
    }
    return bytesToSize(number);
}