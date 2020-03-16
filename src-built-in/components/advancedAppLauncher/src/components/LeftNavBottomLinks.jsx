import React from 'react'
import { getStore } from '../stores/LauncherStore'
import * as UIconfig from '../../../../../configs/application/UIComponents.json'

const bottomEntries = [
	{ name: "New App", icon: "ff-new-workspace", click: "showAddAppForm" },
	//{ name: 'New Dashboard', icon: 'ff-dashboard-new' },
];

export default class LeftNavBottomLinks extends React.Component {

	constructor(props) {
		super(props);
	}

	componentWillMount() {
		// If the app catalog is enabled in the config, add app catalog to the bottom entry of the advanced app launcher menu
		if (UIconfig.components["App Catalog"].enabled) {
			bottomEntries.push({
				name: "App Catalog",
				icon: "ff-list",
				click: "openAppMarket"
			})
		}
	}

	/**
	 * Sets isFormVisible to true in store so that main component
	 * renders the AddNewAppForm component or removes it
	 */
	showAddAppForm() {
		// FSBL.Clients.DialogManager.open("QuickComponentForm", {}, () => { });
		getStore().setValue({
			field: "isFormVisible",
			value: true
		}, (error, data) => {
			error && console.log("Failed to set isFormVisible to true");
		});
	}

	render() {
		return (
			<div className="bottom">
				{
					bottomEntries.map((entry, index) => {
						let handler = entry.click ? this[entry.click] || this.props[entry.click] : Function.prototype;
						let className = "ff-plus-2 complex-menu-action";
						return (
							<div className={className} key={index} onClick={handler}>
								{/* {entry.icon !== undefined ? <i className={entry.icon}></i> : null} */}
								{entry.name}
							</div>
						);
					})
				}
			</div>
		);
	}
}