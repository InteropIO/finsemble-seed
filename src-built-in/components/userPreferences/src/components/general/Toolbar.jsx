import React from 'react';

export default class Toolbar extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			monitor: "all"
		};
		this.setMonitor = this.setMonitor.bind(this);
		this.restartApplication = this.restartApplication.bind(this);
	}

	/**
	 * Sets the monitor by calling the setPreferences API. This will override the config for the component.
	 * @param {event} e
	 */
	setMonitor(e) {
		let monitor = e.target.value;
		this.setState({
			monitor: monitor
		});
		FSBL.Clients.ConfigClient.setPreference({ field: "finsemble.components.Toolbar.window.monitor", value: monitor });
		// There's no need to override spawnOnAllMonitors. Setting monitor to anything other than undefined will automatically override that value. Setting monitor="all" is equivalent.
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
	}

	componentWillUnmount() {
	}

	render() {
		return <div className="complex-menu-content-row">
			<div>
				<span>Display toolbar on monitor</span>
				<select style={{ margin: "0px 10px" }} onChange={this.setMonitor} value={this.state.monitor}>
					<option value={"all"}>All</option>
					<option value={"0"}>Primary</option>
					<option value={"1"}>2</option>
					<option value={"2"}>3</option>
					<option value={"3"}>4</option>
					<option value={"4"}>5</option>
					<option value={"5"}>6</option>
				</select>
				<span> </span>
				<button onClick={this.restartApplication}>Restart Application</button>
			</div>
		</div>
	}
}
