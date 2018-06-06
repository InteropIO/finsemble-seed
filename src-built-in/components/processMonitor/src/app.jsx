import React from "react";
import ReactDOM from "react-dom";
import { Store, Actions } from "./stores/ProcessMonitorStore";
import ListHeader from "./components/ListHeader";
import ProcessStatistics from "./components/ProcessStatistics";
import ChildWindows from "./components/ChildWindows";
import "../processMonitor.css";
import { SIMPLE_MODE_STATISTICS } from "./constants";

//Not used right now. Currently using alerts. This is for the future.
export default class ProcessMonitor extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			processList: []
		};
		this.bindCorrectContext();
	}
	bindCorrectContext() {
		this.onProcessListChanged = this.onProcessListChanged.bind(this);

	}
	onProcessListChanged(err, response) {
		let { value } = response;
		this.setState({
			processList: value
		})
	}
	componentDidMount() {
		Store.addListener({ field: "processList" }, this.onProcessListChanged);
	}
	componentWillUnmount() {
		Store.removeListener({ field: "processList" }, this.onProcessListChanged);
	}
	render() {
		//simple mode: CPU, memory
		//Advanced mode: add more.
		//Use helpers.bytesToSize.
		//Array of process components.
		return (
			<div>
				<div className="process-list-wrapper">
					<ListHeader fields={SIMPLE_MODE_STATISTICS
					}/>
					<div className="process-list">
						{this.state.processList.map((proc, i) => {
							return (<div className="process">
								<ProcessStatistics
									mode="advanced"
									fields={SIMPLE_MODE_STATISTICS
									}
									groupModifier={i}
									stats={proc.statistics} />
								<ChildWindows childWindows={proc.childWindows} />
							</div>)
						})}
					</div>
				</div>
				<div className="summary-statistics">
					summary
				</div>
			</div>
		)
	}
}

FSBL.addEventListener("onReady", function () {
	// var Test = require('./test');
	console.log("appLauncher app onReady");

	Actions.initialize(function (store) {
		ReactDOM.render(
			<ProcessMonitor />
			, document.getElementById("ProcessMonitor-component-wrapper"));
	});
});