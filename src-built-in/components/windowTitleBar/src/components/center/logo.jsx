import React from "react";
import { cpus } from "os";
export default class Logo extends React.PureComponent {
	constructor(props) {
		super();
		this.state = {
			tabLogo: {},
			uuid: Math.random()
		};
		this.wrap = null;
		this.getWrap = this.getWrap.bind(this);
		this.handleComponentConfig = this.handleComponentConfig.bind(this);
	}
	getWrap(cb = Function.prototype) {
		if (this.wrap) return cb(this.wrap);
		FSBL.FinsembleWindow.getInstance(this.props.windowIdentifier, (err, wrapper) => {
			cb(wrapper);
		});
	}
	componentWillReceiveProps(nextProps) {
		//We only need to re-render the logo if the name of the component changes. Otherwise excessive calls to getOptions
		const needsLogo = this.state.tabLogo && typeof this.state.tabLogo.type === "undefined";
		if (needsLogo || nextProps.windowIdentifier.windowName !== this.props.windowIdentifier.windowName) {
			console.log("Getting logo", this.props.windowIdentifier.windowName);
			this.getWrap((wrapper) => {
				wrapper.getOptions(this.handleComponentConfig);
			});
		}
	}

	getIconFromConfig(wi) {
		FSBL.Clients.LauncherClient.getActiveDescriptors((err, descriptors) => {
			let componentConfig = descriptors[this.props.windowIdentifier.windowName];
			if (componentConfig) {
				this.handleComponentConfig(err, componentConfig);

			}

		})
	}
	handleComponentConfig(err, opts) {
		if (!opts || Object.keys(opts).length === 0) {
			return this.getIconFromConfig(this.props.windowIdentifier);
		}

		let tabLogo;
		if (!window.logoCache) window.logoCache = {};
		try {
			if (window.logoCache[this.props.windowIdentifier.windowName]) {
				tabLogo = window.logoCache[this.props.windowIdentifier.windowName];
				console.log("Retrieved tab logo from logo cache");
			}
		} catch (e) {
			//bury error.
		}


		if (!tabLogo) {
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

			tabLogo = {
				type: "icon",
				class: "ff-grid"
			};

			if (fontIcon && fontIcon != "") {
				tabLogo = {
					type: "icon",
					class: fontIcon
				};

			} else if (imageIcon && imageIcon !== "") {
				tabLogo = {
					type: "image",
					url: imageIcon
				}
			}
		}
		//Next time we won't have to go to config/window service to figure out the tab's logo.
		if (window.logoCache[this.props.windowIdentifier.windowName]) {
			window.logoCache[this.props.windowIdentifier.windowName] = tabLogo;
		}
		this.setState({
			tabLogo
		})
	}

	render() {
		return <div className="fsbl-tab-logo">
			{this.state.tabLogo.type === "icon" &&
				<i className={this.state.tabLogo.class}></i>
			}
			{this.state.tabLogo.type === "image" &&
				<img src={this.state.tabLogo.url} />}
		</div>
	}
}