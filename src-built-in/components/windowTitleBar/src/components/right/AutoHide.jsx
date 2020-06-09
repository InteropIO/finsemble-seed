/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import React from "react";
import { FinsembleHoverDetector } from "@chartiq/finsemble-react-controls";

//autohide functions and timers
let headerTimeout = null;
let autohideTimeout = 2000;
let autohideSavedBodyMargin = null;
const autoHideDefaultConfig = {
	defaultSetting: false,
	timeout: 2000,
	resetMargin: true
};
let autoHideConfig = JSON.parse(JSON.stringify(autoHideDefaultConfig));


/**
 * Auto-hide window chrome toggle button.
 */
export default class AutoHide extends React.Component {
	constructor(props) {
		super(props);
		this.changeAutoHide = this.changeAutoHide.bind(this);
		this.hoverAction = this.hoverAction.bind(this);
		this.autoHideTimer = this.autoHideTimer.bind(this);
		this.autoHideMouseMoveHandler = this.autoHideMouseMoveHandler.bind(this);

		this.suspendAutoHide = this.suspendAutoHide.bind(this);
		this.startTile = this.startTile.bind(this);
		this.stopTile = this.stopTile.bind(this);

		this.state = {
			autoHide: false
		};

		FSBL.Clients.ConfigClient.getValue({ field: "finsemble.Window Manager" }, function (err, globalWindowManagerConfig) {
			//get global config
			if (!globalWindowManagerConfig) { globalWindowManagerConfig =  {  }; } 
			autoHideConfig = Object.assign(autoHideDefaultConfig, globalWindowManagerConfig.autoHideIcon);
			//get local config
			let windowTitleBarConfig = FSBL.Clients.WindowClient.options.customData.foreign.components["Window Manager"];
			if (windowTitleBarConfig.autoHideIcon === false || windowTitleBarConfig.autoHideIcon === true ||
				(typeof windowTitleBarConfig.autoHideIcon === 'object' && windowTitleBarConfig.autoHideIcon != null)) {
					autoHideConfig = Object.assign(autoHideConfig, windowTitleBarConfig.autoHideIcon);
			}
			FSBL.Clients.Logger.log("Autohide window chrome settings: ", autoHideConfig);
		});
	}

	autoHideTimer() {
			if (headerTimeout) {clearTimeout(headerTimeout);}
			headerTimeout = setTimeout(function () {
				FSBL.Clients.Logger.system.debug("hiding header...");
				let header = document.getElementsByClassName("fsbl-header")[0];
				header.style.opacity = 0;
			}, autoHideConfig.timeout);
	}

	autoHideMouseMoveHandler( event ) {
		if (headerTimeout) {clearTimeout(headerTimeout);}
		const header = document.getElementsByClassName("fsbl-header")[0];
		header.style.opacity = 1;
		this.autoHideTimer();
	};

	/** Return the default state for autohide (via global or component local config). */
	getDefaultAutoHide() {
		return autoHideConfig.defaultSetting;
	}

	/**
	 * Set state for autohiding the header.
	 */
	setAutoHide(autoHide, cb = Function.prototype) {
		FSBL.Clients.Logger.system.debug("setAutoHide: " + autoHide);

		//preserve the body margin so we can remove and restore it
		if (!autohideSavedBodyMargin){
			autohideSavedBodyMargin = document.body.style.marginTop;
		} 

		if (autoHide){
			let header = document.getElementsByClassName("fsbl-header")[0];

			//ensure autohiding styles are set
			header.style['transition-property'] = "opacity";
			header.style['transition-duration'] = "0.7s";
			header.style['transition-timing-function'] = "ease";

			//setup any activity listeners to re-display window chrome
			let b = document.getElementsByTagName("body")[0];
			b.addEventListener("mousemove", this.autoHideMouseMoveHandler);
			// b.addEventListener("mouseleave", function( event ) {
			// 	console.log("leaving...");
			// 	let header = document.getElementsByClassName("fsbl-header")[0];
			// 	header.style.display = "none";
			// });

			//remove the body margin used to accommodate the header
			if (autoHideConfig.resetMargin){
				document.body.style.marginTop = "0px";
			}

			//set the autohide timer
			this.autoHideTimer();
		} else {
			//clear the autohide timer
			if (headerTimeout) {clearTimeout(headerTimeout);}

			//restore body margin to accommodate header
			if (autoHideConfig.resetMargin){
				document.body.style.marginTop = autohideSavedBodyMargin;
			}

			//unhook activity listeners
			let b = document.getElementsByTagName("body")[0];
			b.removeEventListener("mousemove", this.autoHideMouseMoveHandler);
		}


		cb();
	}

	startTile() {
		this.suspendAutoHide(true);
	}

	stopTile() {
		this.suspendAutoHide(false);
	}

	suspendAutoHide(suspend) {
		let autoHideEnabled = this.state.autoHide;

		if (typeof autoHideEnabled === "undefined") {
			autoHideEnabled = this.getDefaultAutoHide();
		}

		if (autoHideEnabled) {
			if (suspend) {
				let header = document.getElementsByClassName("fsbl-header")[0];
				header.style.opacity = 1;
				if (headerTimeout) {clearTimeout(headerTimeout);}
			} else {
				this.autoHideTimer();
			}
		}
	}

	changeAutoHide() {
		const newState = !this.state.autoHide;
		return this.setAutoHide(newState,  () => {
			FSBL.Clients.WindowClient.setComponentState({
				field: 'autoHide',
				value: newState
			}, () => {
				this.setState({
					autoHide: newState
				});
			});
		});
	}

	componentDidMount() {
		FSBL.Clients.WindowClient.getComponentState({
			field: 'autoHide',
		}, (err, state) => {
			let stateToSet = (err || !state) ? this.getDefaultAutoHide() : state;
			this.setState({
				autoHide: stateToSet
			});
			this.setAutoHide(stateToSet,  () => {
				FSBL.Clients.Logger.system.debug("Loaded with AutoHide state: ", stateToSet);
			});
		});

		FSBL.Clients.RouterClient.addListener("DockingService.startTilingOrTabbing", this.startTile);
		FSBL.Clients.RouterClient.addListener("DockingService.stopTilingOrTabbing", this.stopTile);
		FSBL.Clients.RouterClient.addListener("DockingService.cancelTilingOrTabbing", this.stopTile);
	}

	componentWillUnmount() {
		FSBL.Clients.RouterClient.removeListener("DockingService.startTilingOrTabbing", this.startTile);
		FSBL.Clients.RouterClient.removeListener("DockingService.stopTilingOrTabbing", this.stopTile);
		FSBL.Clients.RouterClient.removeListener("DockingService.cancelTilingOrTabbing", this.stopTile);
	}

	/**
     * When your mouse enters/leaves the hoverDetector, this function is invoked.
     *
     * @param {any} newHoverState
     * @memberof LinkerButton
     */
	hoverAction(newHoverState) {
		this.setState({ hoverState: newHoverState });
	}

	/**
	 * Render method.
	 *
	 * @returns
	 * @memberof AlwaysOnTop
	 */
	render() {
		let iconClasses = "ff-insiders-2 ";
		let wrapClasses = "fsbl-icon ";
		if (this.state && this.state.autoHide) wrapClasses += "fsbl-icon-highlighted ";
		const tooltip = "Auto-hide window chrome";
		return (<div className={wrapClasses} id="fsbl-window-autohide" title={tooltip} data-hover={this.state.hoverState} onClick={this.changeAutoHide} style={this.props.visible ? {} : { display: "none" }}>
				<FinsembleHoverDetector edge="top" hoverAction={this.hoverAction}></FinsembleHoverDetector>
			<i className={iconClasses}></i>
		</div>);
	}
}