import React from "react";
import { Actions } from "../stores/ProcessMonitorStore";
import { HIGH_CPU, HIGH_MEMORY_USAGE, MODERATE_CPU_USAGE, MODERATE_MEMORY_USAGE, TO_MB } from "../constants";
import { prettyPrint } from "../helpers";
import ChildWindows from "./ChildWindows"

//Not used right now. Currently using alerts. This is for the future.
export default class ProcessStatistics extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: true,
            viewMode: props.viewMode,
            childWindows: props.childWindows
        }
        console.log(this.state.childWindows)
        this.toggleVisibility = this.toggleVisibility.bind(this);
    }
    toggleVisibility() {
		this.setState({
			visible: !this.state.visible
        });
	}
    render() {
        //simple mode: CPU, memory
        //Advanced mode: add Peak Memory.
    
        return <div>
            <div className="process-row">
                    {this.state.visible && <span onClick={this.toggleVisibility}>&#9660;</span>}
                    {!this.state.visible && <span onClick={this.toggleVisibility}className="hidden-arrow">&#9654;</span>}
                <div className="process-name"  onClick={this.toggleVisibility}>
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
            {this.state.visible && <div>
                <ChildWindows viewMode={this.state.viewMode} childWindows={this.state.childWindows} />
            </div>}
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
