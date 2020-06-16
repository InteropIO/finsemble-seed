import React, { Component } from "react";
class title extends Component {
	constructor(props) {
		super(props);
		this.state = {
			title: finsembleWindow.name,
		};
		this.getTitle = this.getTitle.bind(this);
	}
	async getTitle(e = null, identifier = this.props.windowIdentifier) {
		let { wrap: win } = await FSBL.FinsembleWindow.getInstance(identifier);

		win.getOptions((err, data) => {
			this.setState({ title: data.title || win.name });
		});
	}
	componentDidMount() {
		this.getTitle();
	}

	//Triggers a re-rendering of the drag handle in the title bar.
	componentDidUpdate() {
		if (typeof this.props.onUpdate === "function") {
			this.props.onUpdate();
		}
	}

	componentWillMount() {
		//todo
		FSBL.FinsembleWindow.getInstance(this.props.windowIdentifier, (e, win) => {
			win.addEventListener("title-changed", this.getTitle);
		});
	}
	componentWillUnmount() {
		//todo
		FSBL.FinsembleWindow.getInstance(this.props.windowIdentifier, (e, win) => {
			win.removeEventListener("title-changed", this.getTitle);
		});
	}
	componentWillReceiveProps(nextProps) {
		//We only need to re-render the logo if the name of the component changes. Otherwise excessive calls to getOptions
		if (
			nextProps.windowIdentifier.windowName !==
			this.props.windowIdentifier.windowName
		) {
			this.getTitle(null, nextProps.windowIdentifier);
		}
	}

	render() {
		let titleWidth = this.props.titleWidth;
		let style = titleWidth
			? {
					width: titleWidth,
			  }
			: {};
		return (
			<div className="fsbl-tab-title" style={style}>
				{/* @todo, figure out where we're setting the title to an empty object.... */}
				{this.state.title}
			</div>
		);
	}
}

export default title;
