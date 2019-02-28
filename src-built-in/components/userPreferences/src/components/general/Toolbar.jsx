import React from 'react';
import Checkbox from '../checkbox';

export default class Toolbar extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			monitor: "0",
			toolbarType: "Floating",
			change: false,
		};
		this.setMonitor = this.setMonitor.bind(this);
		this.toggleToolbarState = this.toggleToolbarState.bind(this);
		this.restartApplication = this.restartApplication.bind(this);
	}

	/**
	 * Sets the monitor by calling the setPreferences API. This will override the config for the component.
	 * Possible values:
	 * All monitors: "all"
	 * Previous monitor when floating (defaults to primary): "0"
	 * @param {event} e
	 */
	setMonitor(value) {
		this.setState({
			monitor: value
		});
		// There's no need to override spawnOnAllMonitors. Setting monitor to anything other than undefined will automatically override that value. Setting monitor="all" is equivalent.
		FSBL.Clients.ConfigClient.setPreference({ field: "finsemble.components.Toolbar.window.monitor", value: value });		
	}

	/**
	 * Sets the toolbar as Fixed or Floating by calling the setPreferences API. This will override the config for the component.
	 * Triggers monitor position based on toolbar option
	 * @param {event}
	 */
	toggleToolbarState() {
		//Use the previous state to toggle the checkbox, Floating is always checked
		let previousState = this.state.toolbarType;
		let toolbarType;
		
		if (previousState === "Fixed") {
			FSBL.Clients.ConfigClient.setPreference({ field: "finsemble.components.Toolbar.window.dockable", value: ["top", "bottom"] });
			FSBL.Clients.ConfigClient.setPreference({ field: "finsemble.components.Toolbar.window.options.resizable", value: true });
			toolbarType = "Floating";
			this.setMonitor("0");
		} else if (previousState === "Floating") {
			FSBL.Clients.ConfigClient.setPreference({ field: "finsemble.components.Toolbar.window.dockable", value: null });
			FSBL.Clients.ConfigClient.setPreference({ field: "finsemble.components.Toolbar.window.options.resizable", value: false });
			toolbarType = "Fixed";
			this.setMonitor("all");
		}
		
		this.setState({
			toolbarType: toolbarType,
			change: true,
		});	
	}

	restartApplication() {
		FSBL.restartApplication();
	}

	/**
	 * Add listener on the store. When the preferences field changes, we change our local state.
	 * Get the intitial state from the store.
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
			let toolbarType = "Fixed";
			if (value) { 
				toolbarType = "Floating";
			}
			//Only set the state if the expected values were found in the config, otherwise use the default
			if (toolbarType){
				this.setState({
					toolbarType: toolbarType
				});
			}
		});
	}

	componentWillUnmount() {
	}

	render() {
		//Render this button only after a change in the checkbox state. It will remain visible until restart.
		const restartButton = this.state.change ? <div><span className="change-text">This change requires a restart.</span><button className="blue-button" onClick={this.restartApplication}>Restart Now</button></div> : null
		return <div className="complex-menu-content-row">
			<Checkbox
			onClick={this.toggleToolbarState}
			checked={this.state.toolbarType === "Floating"}
			label="Float the Toolbar" />				
			<span> </span>
			{restartButton}
		</div>
	}
}
