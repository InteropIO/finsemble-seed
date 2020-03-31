import React from 'react'
import { getStore } from '../stores/LauncherStore'


const bottomEntries = [
	{ name: "New App", icon: "ff-new-workspace", click: "showAddAppForm" },
	//{ name: 'New Dashboard', icon: 'ff-dashboard-new' },
	// { name: "App Catalog", icon: "ff-list", click: "openAppMarket" }
];

export default class LeftNavBottomLinks extends React.Component {

	constructor(props) {
		super(props);
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