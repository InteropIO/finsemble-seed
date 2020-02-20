import React from "react";
import ReactDOM from "react-dom";
import { Store, Actions } from "./stores/ProcessMonitorStore";
import ListHeader from "./components/ListHeader";
import ProcessStatistics from "./components/ProcessStatistics";
import ChildWindows from "./components/ChildWindows";
import "../processMonitor.css";
import { EMPTY_TOTALS, SIMPLE_MODE_STATISTICS, ADVANCED_MODE_STATISTICS } from "./constants";
import { statReducer, round, bytesToSize } from "./helpers"

export default class ProcessMonitor extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			processList: [],
			viewMode: "simple"
		};
		this.bindCorrectContext();
	}
	bindCorrectContext() {
		this.onProcessListChanged = this.onProcessListChanged.bind(this);
		this.onViewModeChanged = this.onViewModeChanged.bind(this);
	}
	/**
	 * Handler for when we go from simple to advanced mode, or the opposite.
	 * @param {} err
	 * @param {*} response
	 */
	onViewModeChanged(err, response) {
		let { value } = response;
		this.setState({
			viewMode: value
		})
	}
	/**
	 * Invoked at minimum, once per second. This listener handles updates that we receive from the system.
	 * @param {*} err
	 * @param {*} response
	 */
	onProcessListChanged(err, response) {
		let { value } = response;
		this.setState({
			processList: value
		})
	}

	componentDidMount() {
		Store.addListener({ field: "processList" }, this.onProcessListChanged);
		Store.addListener({ field: "viewMode" }, this.onViewModeChanged);

	}
	componentWillUnmount() {
		Store.removeListener({ field: "processList" }, this.onProcessListChanged);
		Store.removeListener({ field: "viewMode" }, this.onViewModeChanged);
	}

	render() {
		//simple mode: CPU, memory
		//Advanced mode: add more.
		//Use helpers.bytesToSize.
		//Array of process components.
		//statReducer is an array.reduce function that will sum all of the CPU/memory usage across the app.
		let totals = this.state.processList.length ? this.state.processList.reduce(statReducer) : EMPTY_TOTALS;
		return (
			<div>
				<div className="process-list-wrapper">
					<ListHeader fields={this.state.viewMode === "simple" ? SIMPLE_MODE_STATISTICS : ADVANCED_MODE_STATISTICS
					} />
					<div className="process-list">
						{/* Filter will remove the hidden processes. Afterwards, map will render the remaining processes in turn. */}
						{this.state.processList
							.filter(proc => proc.visible)
							.map((proc, i) => {
								return (<div key={i} className="process">
									{/* Process statistics is the meat of this component. It's the statistics and the child windows. */}
									<ProcessStatistics
										mode={this.state.viewMode}
										fields={this.state.viewMode === "simple" ? SIMPLE_MODE_STATISTICS : ADVANCED_MODE_STATISTICS
										}
										stats={proc.statistics} />
									<ChildWindows viewMode={this.state.viewMode} childWindows={proc.childWindows} />
								</div>)
							})}
					</div>
				</div>

				<div className="bottom-section">
					<div className="summary-statistics-wrapper">
						<div className="summary-statistics-header">
							Finsemble Total Usage
					</div>
						<div className="summary-statistics">
							{typeof totals.statistics.cpuUsage !== "undefined" &&
								<div className="summary-statistic">
									<div className="summary-statistic-label">
										CPU
								</div>
									<div className="summary-statistic-number">
										{round(totals.statistics.cpuUsage, 2) + "%"}
									</div>
								</div>
							}
							{typeof totals.statistics.workingSetSize !== "undefined" &&
								<div className="summary-statistic">
									<div className="summary-statistic-label">
										Memory
								</div>
									<div className="summary-statistic-number">
										{bytesToSize(totals.statistics.workingSetSize)}
									</div>
								</div>
							}
						</div>
					</div>
					<div className="advanced-button-wrapper">
						<div className="fsbl-button advanced-button" onClick={() => { Actions.toggleViewMode() }}>
							{this.state.viewMode === "advanced" ? "Simple" : "Advanced"}</div>
					</div>
				</div>
			</div>
		)
	}
}

if (window.FSBL && FSBL.addEventListener) { FSBL.addEventListener("onReady", FSBLReady); } else { window.addEventListener("FSBLReady", FSBLReady) }
function FSBLReady() {
	// var Test = require('./test');
	//console.log("appLauncher app onReady");

	Actions.initialize(function (store) {
		ReactDOM.render(
			<ProcessMonitor />
			, document.getElementById("ProcessMonitor-component-wrapper"));
	});
}