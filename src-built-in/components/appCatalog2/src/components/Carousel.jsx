/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
/**
 * This component is the name of a component and a pin that will pin that component to all toolbars.
 *
 */
import React, { Component } from "react";

//components
import AppCard from './AppCard';

export default class Carousel extends Component {
	constructor(props) {
		super(props);
		this.state = {
			firstIndex: 0
		}
		this.bindCorrectContext();
	}
	bindCorrectContext() {
		this.pageUp = this.pageUp.bind(this);
		this.pageDown = this.pageDown.bind(this);
	}
	pageUp() {
		let newFirstIndex = (this.state.firstIndex + 1 > this.props.cards.length - 1) ? props.cards.length - 1 : this.state.firstIndex + 1;

		this.setState({
			firstIndex: newFirstIndex
		});
	}
	pageDown() {
		let newFirstIndex = (this.state.firstIndex - 1 < 0) ? this.props.cards.length - 1 : this.state.firstIndex - 1;

		this.setState({
			firstIndex: newFirstIndex
		});
	}
	render() {

		let { cards } = this.props;
		let firstCard = this.state.firstIndex;

		let displayCards = [];
		for (let i = 0; i < 4; i++) {
			if (firstCard > cards.length - 1) {
				displayCards.push(cards[0]);
				firstCard = 0;
			} else {
				displayCards.push(cards[firstCard]);
			}
			firstCard++;
		}

		return (
			<div className="carousel-main">
				<div className="carousel-header">
					<div className="carousel-title">{this.props.tag}</div>
					<button className="see-more">See More</button>
				</div>
				<div className="carousel-content">
					<div className="paginate_carat_left" onClick={this.pageDown} />
					{displayCards.map((card, i) => {
						return (
							<AppCard key={i} {...card} openAppShowcase={this.props.openAppShowcase} />
						);
					})}
					<div className="paginate_carat_right" onClick={this.pageUp} />
				</div>
			</div>
		);
	}
}