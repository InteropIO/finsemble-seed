/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
/**
 * This component is the name of a component and a pin that will pin that component to all toolbars.
 *
 */
import React, { Component } from "react";

export default class Hero extends Component {
	constructor(props) {
		super(props);
		this.state = {
			active: 0
		}
		this.bindCorrectContext();
	}
	bindCorrectContext() {
		this.changePage = this.changePage.bind(this);
		this.openApp = this.openApp.bind(this);
	}
	changePage(action) {
		let { cards } = this.props;
		let newActive = this.state.active;

		if (typeof action === "number") {
			newActive = action;
		} else {
			switch (action) {
				case "page_down":
					newActive = (newActive - 1 < 0) ? cards.length-1 : newActive - 1;
					break;
				case "page_up":
					newActive = (newActive + 1 > cards.length - 1) ? 0 : newActive + 1;
					break;
				default:
					break;
			}
		}

		this.setState({
			active: newActive
		});
	}
	openApp() {
		let name = this.props.cards[this.state.active].title !== undefined ? this.props.cards[this.state.active].title : this.props.cards[this.state.active].name;
		this.props.openAppShowcase(name);
	}
	render() {

		let { active } = this.state;
		let { cards } = this.props;
		let contentTitle = cards[active].title === undefined ? cards[active].name : cards[active].title
		let contentMsg = cards[active].description;

		return (
			<div>
				<div className='hero-main'>
					<i className='ff-chevron-left' onClick={this.changePage.bind(this, 'page_down')} />
					<div className='hero_selected_content' onClick={this.openApp}>
						<div className='selected-content-title'>
							{contentTitle}
						</div>
						<div className='selected-content-message'>
							<p>{contentMsg}</p>
						</div>
					</div>
					<i className='ff-chevron-right' onClick={this.changePage.bind(this, 'page_up')} />
				</div>
				<div className="paginator">
					{cards.map((card, i) => {
						let classes = 'pagination-oval';
						if (i === active) classes += " active";
						return (<div key={i} className={classes} onClick={this.changePage.bind(this, i)} />);
					})}
				</div>
 			</div>
		);
	}
}