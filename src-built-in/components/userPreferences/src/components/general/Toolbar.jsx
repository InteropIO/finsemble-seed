import React from 'react';

export default class Toolbar extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			monitor: "all"
		};
		this.setMonitor = this.setMonitor.bind(this);
		this.setToolbarState = this.setToolbarState.bind(this);
		this.restartApplication = this.restartApplication.bind(this);
	}

	/**
	 * Sets the monitor by calling the setPreferences API. This will override the config for the component.
	 * Using all works, but nothing else works from existing code. Likely a mismatch between values used for monitor. Need to pull current monitors in.
	 * @param {event} e
	 */
	setMonitor(e) {
		let monitor = e.target.value;
		console.log("MONITOR: ", e.target.value);
		this.setState({
			monitor: monitor
		});
		FSBL.Clients.ConfigClient.setPreference({ field: "finsemble.components.Toolbar.window.monitor", value: monitor });
		// There's no need to override spawnOnAllMonitors. Setting monitor to anything other than undefined will automatically override that value. Setting monitor="all" is equivalent.
	}

	/**
	 * Sets the toolbar as fixed or floating by calling the setPreferences API. This will override the config for the component.
	 * @param {event} e
	 */
	setToolbarState(e) {
		let toolbarType = e.target.value;
		this.setState({
			toolbarType: toolbarType
		});
		if (toolbarType === "Fixed") {
			FSBL.Clients.ConfigClient.setPreference({ field: "finsemble.components.Toolbar.window.dockable", value: null });
		} else if (toolbarType === "Floating") {
			FSBL.Clients.ConfigClient.setPreference({ field: "finsemble.components.Toolbar.window.dockable", value: ["top", "bottom"] });
		}
	}

	//Create a list of monitors available to move toolbar to.
	//Not including all monitors because we have no current way to tell the users which monitor is which
	createSelectItems() {
		let items = [];
		if (this.state.toolbarType === "Fixed") {
			items.push(<option value={"all"}>All</option>);
		}
		items.push(<option value={"0"}>Primary</option>);
		items.push(<option value={this.state.monitor}>Current Location</option>);
		console.log(items);
		return items;
	}

	restartApplication() {
		FSBL.restartApplication();
	}

	/**
	 * Add listener on the store. When the preferences field changes, we change our local state.
	 * Also, get the intiial state from the store.
	 */
	componentDidMount() {
		FSBL.Clients.ConfigClient.getValue("finsemble.components.Toolbar.window.monitor", (err, value) => {
			if (!value) value = "all";
			this.setState({
				monitor: value
			});
		});
		//Unless we want to add another config variable tracking dockable state we need to determine state
		//using the set values.
		FSBL.Clients.ConfigClient.getValue("finsemble.components.Toolbar.window.dockable", (err, value) => {
			console.log("GETVALUE INIT: " , JSON.stringify(value));
			if (!value) { 
				value = "Fixed";
			} else if (JSON.stringify(value) === JSON.stringify(["top", "bottom"])) {
				value = "Floating";
			}
			this.setState({
				toolbarType: value
			});
		});
	}

	componentWillUnmount() {
	}

	render() {
		return <div className="complex-menu-content-row">
			<div>			    
				<span>Toolbar Type</span>
				<p>Floating: <input type="radio" name="toolbarState" value="Floating" onChange={this.setToolbarState} checked={this.state.toolbarType === "Floating"}/></p>
				<p>Fixed: <input type="radio" name="toolbarState" value="Fixed" onChange={this.setToolbarState} checked={this.state.toolbarType === "Fixed"} /></p>
				<span>Display toolbar on monitor</span>				
				<select style={{ margin: "0px 10px" }} onChange={this.setMonitor} value={this.state.monitor}>
					{this.createSelectItems()}					
				</select>
				<span> </span>
				<button onClick={this.restartApplication}>Restart Application</button>
			</div>
		</div>
	}
}
