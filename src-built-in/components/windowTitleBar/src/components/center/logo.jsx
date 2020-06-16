/**
 * This file is no longer used in Finsemble 3.x as of 3.10.
 * It is left in place in case any external developers are directly referencing it.
 * This avoids having a completely broken build on upgrading.
 */

import React from "react";
export default class Logo extends React.PureComponent {
	constructor(props) {
		super();
		this.state = {
			tabLogo: {},
			uuid: Math.random(),
		};
		this.wrap = null;
		this.getWrap = this.getWrap.bind(this);
		this.handleComponentConfig = this.handleComponentConfig.bind(this);
	}
	getWrap(cb = Function.prototype) {
		if (this.wrap) return cb(this.wrap);
		FSBL.FinsembleWindow.getInstance(
			this.props.windowIdentifier,
			(err, wrapper) => {
				cb(wrapper);
			}
		);
	}
	componentWillReceiveProps(nextProps) {
		//We only need to re-render the logo if the name of the component changes. Otherwise excessive calls to getOptions
		if (
			nextProps.windowIdentifier.windowName !==
			this.props.windowIdentifier.windowName
		) {
			this.getWrap((wrapper) => {
				if (!wrapper.getOptions) {
					return this.getIconFromConfig(this.props.windowIdentifier);
				}
				wrapper.getOptions(this.handleComponentConfig);
			});
		}
	}

	getIconFromConfig(wi) {
		FSBL.Clients.LauncherClient.getComponentDefaultConfig(
			wi.componentType,
			(err, config) => {
				//This is just to make sure the object is the same shape as what comes back from getOptions.
				this.getWrap((wrapper) => {
					this.handleComponentConfig(err, { customData: config });
				});
			}
		);
	}
	handleComponentConfig(err, opts) {
		let fontIcon;
		try {
			fontIcon = opts.customData.foreign.components.Toolbar.iconClass;
		} catch (e) {
			fontIcon = "";
		}

		var imageIcon;
		try {
			imageIcon = opts.customData.foreign.components.Toolbar.iconURL;
		} catch (e) {
			imageIcon = "";
		}
		if (fontIcon && fontIcon != "") {
			this.setState({
				tabLogo: {
					type: "icon",
					class: fontIcon,
				},
			});
		} else if (imageIcon && imageIcon !== "") {
			this.setState({
				tabLogo: {
					type: "image",
					url: imageIcon,
				},
			});
		} else {
			this.setState({
				tabLogo: {
					type: "icon",
					class: "ff-grid",
				},
			});
		}
	}

	render() {
		return (
			<div className="fsbl-tab-logo">
				{this.state.tabLogo.type === "icon" && (
					<i className={this.state.tabLogo.class}></i>
				)}
				{this.state.tabLogo.type === "image" && (
					<img src={this.state.tabLogo.url} />
				)}
			</div>
		);
	}
}
