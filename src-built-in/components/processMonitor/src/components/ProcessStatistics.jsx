import React from "react";
import { Store, Actions } from "../stores/ProcessMonitorStore";
import { SIMPLE_MODE_STATISTICS, ADVANCED_MODE_STATISTICS, HIGH_CPU, HIGH_MEMORY_USAGE, MODERATE_CPU_USAGE, MODERATE_MEMORY_USAGE, TO_MB } from "../constants";
import { bytesToSize, round } from "../helpers";
//Not used right now. Currently using alerts. This is for the future.
export default class ProcessStatistics extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        //simple mode: CPU, memory
        //Advanced mode: add Peak Memory.
        return <div className="process-row">
            <div className="process-name">
                {/* In simple mode, we print out "Group 1", "Group 2", etc. The belief is that end users don't care about our wonderful process names ("e.g., Default-Agent-62-4421). In advanced mode, you get the actual name of the process.  */}
                {this.props.mode === "simple" ? "Process Group" : this.props.stats.name}
            </div>
            <div className="process-statistics">
                {this.props.fields.map((field, i) => {
                    return (<div key={i} className={getClassesForStat(this.props.stats[field.value], field.label)}>
                        {prettyPrint(this.props.stats[field.value], field.label)}
                    </div>)
                })}
                <div className="statistic process-actions">
                    <div className=" terminate fsbl-button-negative process-action" onClick={() => {
                        Actions.terminateProcess(this.props.stats)
                    }}>Terminate</div>
                </div>
            </div>
        </div>
    }
}

/**
 * Given a number, will return modifier classes that change the background. High usage === red. Moderate === orange.
 * @param {number} number
 * @param {string} statType
 */
function getClassesForStat(number, statType) {
    let classes = "statistic",
        high_comparison = HIGH_MEMORY_USAGE * TO_MB,
        moderate_comparison = MODERATE_MEMORY_USAGE * TO_MB;

    if (statType === "CPU") {
        high_comparison = HIGH_CPU,
            moderate_comparison = MODERATE_CPU_USAGE;
    }
    if (number > high_comparison) {
        classes += " high-usage"
    } else if (number > moderate_comparison) {
        classes += " moderate-usage";
    }
    return classes;
}

/**
 * Outputs something nice,. 102423465243 outputs whatever that number is in KB/MB/GB.
 * 0.035123 will output 0.35% for CPU.
 * @param {number} number
 * @param {string} statType
 */
function prettyPrint(number, statType) {
    if (statType === "CPU") {
        //make it a percent.
        return round(number, 2) + "%";
    } else if (statType !== "PID") {
        return bytesToSize(number);
    } else {
        return number;
    }
}