/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/

import React from "react";

/**
 * The header of the AppShowcase. Contains the actionable buttons (to add/remove and app) and the app title and icon
 * @param {object} props Component props
 * @param {string} props.iconUrl The image url for the app's icon
 * @param {string} props.name The app name
 * @param {func} props.appAction The function to call when a button is clicked.
 */
const Header = props => {
	return (
		<div className="header">
			<div className='icon-title-container'>
				<img className="header-icon" src={props.iconUrl} />
				<span className="appName">{props.name}</span>
			</div>
			<div className='action-button-container'>
				{props.installed ? <button className={props.entitled ? "action-button disabled" : "action-button"} disabled={props.entitled} onClick={props.appAction}>
					<div className='remove-button' onClick={this.removeApp}>
						<i className='ff-close-2'></i>
						&nbsp;Remove App
					</div>
				</button> : null}
				<button className={props.entitled ? "action-button disabled" : "action-button"} disabled={props.entitled} onClick={props.appAction}>
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