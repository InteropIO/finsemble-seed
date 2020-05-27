/*!
* Copyright 2017 - 2020 by ChartIQ, Inc.
* All rights reserved.
*/

import React from "react";

//data
import storeActions from "../../stores/storeActions";

let pendingSpawn = false;

/**
 * The header of the AppShowcase. Contains the actionable buttons (to add/remove and app) and the app title and icon
 * @param {object} props Component props
 * @param {string} props.iconUrl The image url for the app's icon
 * @param {string} props.name The app name
 * @param {func} props.appAction The function to call when a button is clicked.
 */
const Header = props => {

	const addApp = () => {

		if (props.installed) {
			if (pendingSpawn) return;
			pendingSpawn = true;
			const name = props.title || props.name;
			// If the app has a URL property
			// For now, this means it was manually added
			// So lets spawn from URL
			if (props.url) {
				FSBL.Clients.LauncherClient.spawn(null, {
					url: props.url,
					addToWorkspace:true
				}, () => {
					pendingSpawn = false;
				});
				return;
			}
			// Otherwise launch application by name
			FSBL.Clients.LauncherClient.spawn(name, {addToWorkspace:true}, (err, data) => {
				pendingSpawn = false;
			});
		} else {
			storeActions.addApp(props.appId);
		}
	};

	const removeApp = () => {
		storeActions.removeApp(props.appId);
	};

	return (
		<div className="header">
			<div className='icon-title-container'>
				<img className="header-icon" src={props.iconUrl} />
				<span className="appName">{props.name}</span>
			</div>
			<div className='action-button-container'>
				<button className={props.entitled ? "action-button open" : "action-button disabled"} disabled={!props.entitled} onClick={addApp}>
					{props.installed ? (
						<div>
							<span className="action-button-label">Open</span>
						</div>
					) : (
							<span className="action-button-label">
								Add
							</span>
						)}
				</button>
				{props.installed && <button className={props.entitled ? "action-button remove" : "action-button remove disabled"} disabled={!props.entitled} onClick={removeApp}>
					<div title='Remove App'>
						<span className="action-button-label">Remove</span>
					</div>
				</button>}
			</div>
		</div>
	);
};

export default Header;