import React from "react";
import { Store as UserPreferencesStore } from "../stores/UserPreferencesStore";

export default class LeftNav extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			activeSection: props.entries ? props.entries[0].name : "",
			headerImgUrl: "",
		};
	}
	setActiveSection(name) {
		let activeSection = UserPreferencesStore.getValue({
			field: "activeSection",
		});
		if (activeSection !== name) {
			this.setState({
				activeSection: name,
			});
			UserPreferencesStore.setValue({ field: "activeSection", value: name });
		}
	}
	componentDidMount() {
		FSBL.Clients.ConfigClient.getValues(null, (err, config) => {
			if (config.startup_app && config.startup_app.applicationIcon) {
				this.setState({
					headerImgUrl: config.startup_app.applicationIcon,
				});
			}
		});
	}
	render() {
		let navEntries = this.props.entries;

		return (
			<div className="complex-menu-left-nav">
				<div className="complex-menu-left-nav-header">Preferences</div>
				{navEntries.map((el, i) => {
					let sectionToggleClasses = "complex-menu-section-toggle";
					if (el.name === this.state.activeSection) {
						sectionToggleClasses += " active-section-toggle";
					}
					return (
						<div
							className={sectionToggleClasses}
							key={i}
							onClick={() => {
								this.setActiveSection(el.name);
							}}
						>
							{el.label}
						</div>
					);
				})}
			</div>
		);
	}
}
