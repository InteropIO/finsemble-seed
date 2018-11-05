/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/

import React from "react";

//data
import storeActions from '../../stores/storeActions';

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
			//TODO: Open app
		} else {
			storeActions.addApp(props.appId);
		}
	}

	const removeApp = () => {
		storeActions.removeApp(props.appId);
	}

	return (
		<div className="header">
			<div className='icon-title-container'>
				<img className="header-icon" src={props.iconUrl} />
				<span className="appName">{props.name}</span>
			</div>
			<div className='action-button-container'>
				{props.installed && <button className={props.entitled ? "action-button disabled" : "action-button remove"} disabled={props.entitled} onClick={removeApp}>
					<div className='remove-button'>
						&nbsp;Remove
					</div>
				</button>}
				<button className={props.entitled ? "action-button disabled" : "action-button open"} disabled={props.entitled} onClick={addApp}>
					{props.installed ? (
						<div>
							<span className="action-button-label">Open</span>
						</div>
					) : (
						<span className="action-button-label">
							<i className="ff-plus"></i>
							&nbsp;My Apps
						</span>
					)}
				</button>
			</div>
		</div>
	);
}

export default Header;