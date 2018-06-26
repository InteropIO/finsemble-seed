import React from "react";
export default class Logo extends React.Component {
	constructor() {
		super();
		this.state = {
			tabLogo: {}
		}
		this.handleComponentConfig = this.handleComponentConfig.bind(this);
	}
	getIconFromConfig(wi) {
		FSBL.Clients.LauncherClient.getComponentDefaultConfig(wi.componentType, (err, config) => {
			//This is just to make sure the object is the same shape as what comes back from getOptions.
			this.handleComponentConfig(err, { customData: config });
		})
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
					class: fontIcon
				}
			})
		} else if (imageIcon && imageIcon !== "") {
			this.setState({
				tabLogo: {
					type: "image",
					url: imageIcon
				}
			})
		} else {
			this.setState({
				tabLogo: {
					type: "icon",
					url: "ff-grid"
				}
			})
		}
	}
	componentWillReceiveProps(nextProps) {
		//We only need to re-render the logo if the name of the component changes. Otherwise this sucker would fire umpteen times.
		if (this.state.tabLogo.type && nextProps.windowIdentifier.windowName === this.props.windowIdentifier.name) return;
		let wrap = FSBL.FinsembleWindow.wrap(nextProps.windowIdentifier, (err, wrapper) => {
			if (!wrapper.getOptions) {
				return this.getIconFromConfig(nextProps.windowIdentifier);
			}
			wrapper.getOptions(this.handleComponentConfig);
		});
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