/*!
 * Copyright 2017 - 2020 by ChartIQ, Inc.
 * All rights reserved.
 */
/**
 * This component is the name of a component and a pin that will pin that component to all toolbars.
 *
 */
import React, { Component } from "react";

/**
 * The hero component at the top of the App Catalog homepage. Display images and textual descriptions of showcased apps
 * @param {object} props Component props
 * @param {}
 */
export default class Hero extends Component {
	constructor(props) {
		super(props);
		this.state = {
			active: 0,
		};
		this.bindCorrectContext();
	}
	bindCorrectContext() {
		this.changePage = this.changePage.bind(this);
		this.openApp = this.openApp.bind(this);
	}
	/**
	 * Changes the page of the hero component depending on the action its handed
	 * @param {string} action One of 'page_down' or 'page_up'. Any other action is ignored
	 */
	changePage(action) {
		let { cards } = this.props;
		let newActive = this.state.active;

		if (typeof action === "number") {
			newActive = action;
		} else {
			switch (action) {
				case "page_down":
					newActive = newActive - 1 < 0 ? cards.length - 1 : newActive - 1;
					break;
				case "page_up":
					newActive = newActive + 1 > cards.length - 1 ? 0 : newActive + 1;
					break;
				default:
					break;
			}
		}

		this.setState({
			active: newActive,
		});
	}
	/**
	 * Called the parent function to open the AppShowcase for the clicked app
	 */
	openApp() {
		this.props.viewAppShowcase(this.props.cards[this.state.active].appId);
	}
	render() {
		let { active } = this.state;
		let { cards } = this.props;
		let contentTitle =
			cards[active].title === undefined
				? cards[active].name
				: cards[active].title;
		let contentMsg = cards[active].description;
		let imageUrl = cards[active].images
			? cards[active].images[0].url
			: "../assets/placeholder.svg";

		let bgImageStyle = {
			background: "no-repeat left center/contain url(" + imageUrl + ")",
		};

		return (
			<div>
				<div className="hero-main">
					<i
						className="ff-adp-chevron-left"
						onClick={this.changePage.bind(this, "page_down")}
					/>
					<div className="hero-wrapper" onClick={this.openApp}>
						<div className="selected-content-info">
							<div className="selected-content-title">{contentTitle}</div>
							<div className="selected-content-message">{contentMsg}</div>
						</div>
						<div className="hero_selected_content" style={bgImageStyle}></div>
					</div>
					<i
						className="ff-adp-chevron-right"
						onClick={this.changePage.bind(this, "page_up")}
					/>
				</div>
				<br />
				{cards.length >= 2 && cards.length <= 10 && (
					<div className="paginator">
						{cards.map((card, i) => {
							let classes = "pagination-oval";
							if (i === active) classes += " active";
							return (
								<div
									key={i}
									className={classes}
									onClick={this.changePage.bind(this, i)}
								/>
							);
						})}
					</div>
				)}
			</div>
		);
	}
}
