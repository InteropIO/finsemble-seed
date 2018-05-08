import React from "react";
import ReactDOM from "react-dom";
import ReactTable from "react-table";
import { statReducer, toProperCase, bytesToSize } from "./helpers";
import ExpandedApplication from "./components/ExpandedApplication";
import CellRenderer from "./components/CellRenderer"
import Totals from "./components/Totals"
import "react-table/react-table.css";
import Toast from "./components/Toast";
import { initialize as StoreInit, Actions } from "./stores/ProcessMonitorStore";
import "../processMonitor.css";
import "../../assets/css/finfont.css";
import "../../assets/css/finsemble.css";
import { SHOW_PAGINATION, COLLAPSE_ON_DATA_CHANGE, TABLE_CLASSES, statsWeCareAbout, EMPTY_TOTALS } from "./constants";
let APP_UPDATE_INTERVAL,
	Store,
	TABLE_REFERENCE;

class AppTable extends React.Component {
	constructor(props) {
		super(props);
		let DEFAULT_EXPAND = false;
		let expanded = [];
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
		this.onSortedChange = this.onSortedChange.bind(this);
	}
	/**
	 * Toggle for expand all/collapse all.
	 */
	toggleDefaultExpansion() {
		let newExpandAll = !this.state.expandAll;
		let expanded = [];

		//If we're expanding everything, push each UUID into the array.
		if (newExpandAll) {
			this.state.data.forEach((d, i) => { expanded.push(d.uuid) })
		}
		this.setState({
			expandAll: newExpandAll,
			expanded: expanded
		})
	}
	/**
	 * Goes through and creates an array of column descriptors.
	 */
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

	/**
	 * Polling function that retrieves
	 */
	updateAppStats() {
		fin.desktop.System.getProcessList(list => {
			let oldExpanded = this.state.expanded;
			let newExpanded = {};
			this.setState({
				data: list,
				expanded: Object.keys(newExpanded).length ? newExpanded : oldExpanded
			});
		});
	}

	/**
	 * Just adds an expanded classname on the row, which changes the max-height, allowing the content to flow properly.
	 * @param {*} state
	 * @param {*} rowInfo
	 * @param {*} something
	 * @param {*} table
	 */
	getTrGroupProps(state, rowInfo, something, table) {
		TABLE_REFERENCE = table;
		let className = "";
		if (this.state.expanded.includes(rowInfo.original.uuid)) {
			className += " expanded";
		}
		return { className };
	}

	/**
	 * When the user expands a row, we keep track of the application's UUID in an array. When the table renders, we map that back to the row's rendered index.
	 * @param {*} newExpanded
	 * @param {*} index
	 * @param {*} event
	 */
	onExpandedChange(newExpanded, index, event) {
		let expandedRows = Object.keys(newExpanded);
		newExpanded = [];
		let expandedIds = [];
		if (TABLE_REFERENCE && TABLE_REFERENCE.state && TABLE_REFERENCE.state.sortedData) {
			let sortedRows = TABLE_REFERENCE.state.sortedData;
			expandedRows.forEach(ind => {
				let rowUUID = sortedRows[Number(ind)]._original.uuid;
				//If this is the row that was clicked on
				if (index[0] === Number(ind)) {
					//If it isn't expanded, expand it.
					if (!this.state.expanded.includes(rowUUID)) {
						newExpanded.push(rowUUID);
					}
				} else {
					//If it wasn't just clicked and it was previously expanded, it should still be expanded.
					newExpanded.push(rowUUID);
				}
			});
		}

		this.setState({ expanded: newExpanded });
	}

	/**
	 * Invoked when the user sorts a column.
	 * @param {Object} newSorted
	 * @param {*} column
	 * @param {*} shiftKey
	 */
	onSortedChange(newSorted, column, shiftKey) {
		//Collapses rows on sort.
		this.setState({
			expanded: []
		});
	}

	componentWillUnmount() {
		clearInterval(APP_UPDATE_INTERVAL);
	}

	componentWillMount() {
		this.updateAppStats();
		APP_UPDATE_INTERVAL = setInterval(this.updateAppStats, 1000);
	}
	//Terminate the process and collapse all rows. This is triggered from ExpandedApplication.jsx
	terminateProcess(params) {
		Actions.terminateProcess(params);
		this.setState({
			expanded: []
		});
	}
	render() {
		const { expanded, toastMessage, toastClasses } = this.state;
		let data = JSON.parse(JSON.stringify(this.state.data));
		let totals = data.length ? data.reduce(statReducer) : EMPTY_TOTALS;
		let columns = this.columns;
		// debugger;
		let newExpanded = expanded;

		let expandedObject = {};
		//This mapping exists because react-table uses the "viewIndex" of a row to determine whether it's expanded.
		//This doesn't matter if you have a static dataset. This table has a dynamic dataset that changes every half second.
		//So to fully understand why this exists, imagine the following scenario: You sort on CPU usage, and expand the 2nd row.
		//The CPU usage updates, and now the row is moved four rows down. React-table thinks the 2nd row is still expanded.
		//In reality, that row has moved four rows down. So the mapping below just keeps track of where our rows actually are, not where react-table thinks they are.
		if (TABLE_REFERENCE && TABLE_REFERENCE.state) {
			//This is an internal function that react-table calls during its render. We call it here so that we can set the expanded Object to reflect the reality that's about to be created when the table goes through its render.
			let sortedData = TABLE_REFERENCE.sortData(data, TABLE_REFERENCE.state.sorted);
			expanded.forEach(rowUUID => {
				let expandedViewIndex = sortedData.findIndex(row => row.uuid === rowUUID);
				expandedObject[expandedViewIndex] = true;
			});
		}

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
					multiSort={false}
					expanded={expandedObject}
					pageSize={data.length}
					columns={columns}
					collapseOnDataChange={COLLAPSE_ON_DATA_CHANGE}
					collapseOnSortingChange={true}
					showPagination={SHOW_PAGINATION}
					getTrGroupProps={this.getTrGroupProps}
					className={TABLE_CLASSES}
					onExpandedChange={this.onExpandedChange}
					onSortedChange={this.onSortedChange}
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