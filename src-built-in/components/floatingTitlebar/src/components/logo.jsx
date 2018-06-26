import React from "react";
export default class Logo extends React.PureComponent {
	constructor(props) {
		super();
		this.state = {
			tabLogo: {},
			uuid: Math.random()
		}
		this.handleComponentConfig = this.handleComponentConfig.bind(this);
		console.log("constructor for", props.windowIdentifier.windowName, this.state.uuid);
	}
	componentDidMount() {
		let wrap = FSBL.FinsembleWindow.wrap(this.props.windowIdentifier, (err, wrapper) => {
			if (!wrapper.getOptions) {
				return this.getIconFromConfig(this.props.windowIdentifier);
			}
			wrapper.getOptions(this.handleComponentConfig);
		});
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
		console.log("Setting state for", opts.name, this.state.uuid, fontIcon);
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
					class: "ff-grid"
				}
			})
		}
	}

	render() {
		console.log("RENDER FOR", this.state.uuid, this.state.tabLogo);
		return <div className="fsbl-tab-logo">
			{this.state.tabLogo.type === "icon" &&
				<i className={this.state.tabLogo.class}></i>
			}
			{this.state.tabLogo.type === "image" &&
				<img src={this.state.tabLogo.url} />}
		</div>
	}
}