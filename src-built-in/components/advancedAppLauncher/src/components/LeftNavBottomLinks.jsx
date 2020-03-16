import React from 'react'
import { getStore } from '../stores/LauncherStore'

export default class LeftNavBottomLinks extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			bottomEntries: [
				{ name: "New App", icon: "ff-new-workspace", click: "showAddAppForm" },
				//{ name: 'New Dashboard', icon: 'ff-dashboard-new' },
			]
		}
	}

	componentWillMount() {
		finsembleWindow.getOptions((_, opts) => {
			const useAppCatalog = (((opts || {}).customData || {}).component || {}).useAppCatalog;
			if (useAppCatalog) {
				this.setState((prevState) => ({
					bottomEntries: [
						...prevState.bottomEntries,
						{
							name: "App Catalog",
							icon: "ff-list",
							click: "openAppMarket"
						}
					]
				}));
			}
		});
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
					this.state.bottomEntries.map((entry, index) => {
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