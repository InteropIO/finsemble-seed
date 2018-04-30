import React from "react";
import ReactDOM from "react-dom";
import ReactTable from "react-table";
import { statReducer, toProperCase, bytesToSize } from "./helpers";
import ExpandedApplication from "./components/ExpandedApplication";
import CellRenderer from "./components/CellRenderer"
import Totals from "./components/Totals"
import "react-table/react-table.css";
import Toast from "./components/Toast";
import { initialize as StoreInit } from "./stores/ProcessMonitorStore";
import "../processMonitor.css";
import "../../assets/css/finfont.css";
import "../../assets/css/finsemble.css";
import { SHOW_PAGINATION, COLLAPSE_ON_DATA_CHANGE, TABLE_CLASSES, statsWeCareAbout, EMPTY_TOTALS } from "./constants";
let APP_UPDATE_INTERVAL,
	Store;

class AppTable extends React.Component {
	constructor(props) {
		super(props);
		let DEFAULT_EXPAND = false;
		let expanded = {};
		this.state = {
			data: [],
			expanded: expanded,
			expandAll: DEFAULT_EXPAND,
			toastMessage: null,
			toastClasses: "toast"
		};
		this.appData = {};
		this.columns = this.getColumns();


		this.toggleDefaultExpansion = this.toggleDefaultExpansion.bind(this);
		this.updateAppStats = this.updateAppStats.bind(this);
		this.onExpandedChange = this.onExpandedChange.bind(this);
		this.getTrGroupProps = this.getTrGroupProps.bind(this);
	}
	toggleDefaultExpansion() {
		let newExpandAll = !this.state.expandAll;
		let expanded = {};
		this.state.data.forEach((d, i) => { expanded[i] = newExpandAll })
		this.setState({
			expandAll: newExpandAll,
			expanded: expanded
		})
	}
	getColumns() {
		let cols = [];

		for (let i = 0; i < statsWeCareAbout.length; i++) {
			let stat = statsWeCareAbout[i];

			cols.push(
				{
					Header: toProperCase(stat),
					accessor: stat,
					width: i === 0 ? 250 : "auto",
					Cell: CellRenderer
				}
			)
		}
		return cols;
	}

	updateAppStats() {
		fin.desktop.System.getProcessList(list => {
			this.setState({
				data: list
			});
		});
	}


	//Just adds an expanded classname on the row, which changes the max-height, allowing the content to flow properly.
	getTrGroupProps(state, rowInfo) {
		let className = "";
		if (this.state.expanded[rowInfo.index]) {
			className += " expanded";
		}
		return { className }
	}

	onExpandedChange(newExpanded, index, event) {
		this.setState({ expanded: newExpanded })
	}
	componentWillUnmount() {
		clearInterval(APP_UPDATE_INTERVAL);
	}
	componentWillMount() {
		this.updateAppStats();
		APP_UPDATE_INTERVAL = setInterval(this.updateAppStats, 500);
	}

	render() {
		const { expanded, toastMessage, toastClasses } = this.state;
		let { data } = this.state;
		let totals = data.length ? data.reduce(statReducer) : EMPTY_TOTALS;
		let columns = this.columns;
		return (
			<div>
				<ReactTable
					data={data}
					expanderDefaults={{
						sortable: false,
						resizable: false,
						filterable: false,
						width: 33
					}}
					expanded={expanded}
					pageSize={data.length}
					columns={columns}
					collapseOnDataChange={COLLAPSE_ON_DATA_CHANGE}
					showPagination={SHOW_PAGINATION}
					getTrGroupProps={this.getTrGroupProps}
					className={TABLE_CLASSES}
					onExpandedChange={this.onExpandedChange}
					SubComponent={ExpandedApplication.bind(this)}
				/>
				<Totals data={totals}/>
				<div className="fsbl-button visiblity-toggle" onClick={this.toggleDefaultExpansion}>{this.state.expandAll ? "Collapse All" : "Expand all"}</div>
				<Toast className={toastClasses} message={toastMessage} />
			</div>
		);
	}
}

FSBL.addEventListener("onReady", () => {
	StoreInit((store) => {
		Store = store;
		ReactDOM.render(<AppTable />,
			document.getElementById("ProcessMonitor-component-wrapper"));
	});
});