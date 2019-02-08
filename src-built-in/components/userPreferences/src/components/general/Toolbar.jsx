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
		this.setToolbarState = this.setToolbarState.bind(this);
		this.restartApplication = this.restartApplication.bind(this);
	}

	/**
	 * Sets the monitor by calling the setPreferences API. This will override the config for the component.
	 * Possible values:
	 * All monitors: "all"
	 * Primary monitor: "0"
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
	 * Sets the monitor to position the toolbar on to all monitors for Fixed the primary montior for Floating
	 * @param {event}
	 */
	setToolbarState() {
		//Use the previous state to toggle the checkbox, Floating is always checked
		let previousState = this.state.toolbarType;
		let toolbarType;
		
		if (previousState === "Fixed") {
			FSBL.Clients.ConfigClient.setPreference({ field: "finsemble.components.Toolbar.window.dockable", value: ["top", "bottom"] });
			toolbarType = "Floating";
			//set monitor to primary
			this.setMonitor("0");
		} else if (previousState === "Floating") {
			FSBL.Clients.ConfigClient.setPreference({ field: "finsemble.components.Toolbar.window.dockable", value: null });
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
		//Render this button only after a change in the checkbox state. It will remain visible unti restart.
		const restartButton = this.state.change ? <div><span className="change-text">This change requires a restart.</span><button className="blue-button" onClick={this.restartApplication}>Restart Now</button></div> : null
		return <div className="complex-menu-content-row">
			<Checkbox
			onClick={this.setToolbarState}
			checked={this.state.toolbarType === "Floating"}
			label="Float the Toolbar" />				
			<span> </span>
			{restartButton}
		</div>
	}
}
