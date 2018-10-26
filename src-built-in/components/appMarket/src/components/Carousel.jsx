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
			firstIndex: 0,
			titleHighlighted: false
		}
		this.bindCorrectContext();
	}
	bindCorrectContext() {
		this.pageUp = this.pageUp.bind(this);
		this.pageDown = this.pageDown.bind(this);
		this.highlightTitle = this.highlightTitle.bind(this);
		this.seeMore = this.seeMore.bind(this);
	}
	pageUp() {
		let newFirstIndex = (this.state.firstIndex + 1 > this.props.cards.length - 1) ? 0 : this.state.firstIndex + 1;

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
	highlightTitle(highlight) {
		this.setState({
			titleHighlighted: highlight
		});
	}
	seeMore() {
		this.props.seeMore(this.props.tag);
	}
	render() {

		let { cards } = this.props;
		let firstCard = this.state.firstIndex;

		let displayCards = [];
		for (let i = 0; i < 4; i++) {
			if (firstCard > cards.length - 1) {
				firstCard = 0;
			}

			displayCards.push(cards[firstCard]);
			firstCard++;
		}

		let titleClass = "carousel-title";
		if (this.state.titleHighlighted) titleClass += " highlight";

		return (
			<div className="carousel-main">
				<div className="carousel-header">
					<div className={titleClass} onClick={this.seeMore} onMouseEnter={this.highlightTitle.bind(this, true)} onMouseLeave={this.highlightTitle.bind(this, false)}>{this.props.tag[0].toUpperCase() + this.props.tag.substring(1)}</div>
					<button className="see-more" onClick={this.seeMore}><span className='button-label'>See More</span></button>
				</div>
				<div className="carousel-content">
					<i className="ff-chevron-left" onClick={this.pageDown} />
					{displayCards.map((card, i) => {
						return (
							<AppCard key={(card.title || card.name) + i} {...card} openAppShowcase={this.props.openAppShowcase} addApp={this.props.addApp} removeApp={this.props.removeApp} addTag={this.props.addTag} />
						);
					})}
					<i className="ff-chevron-right" onClick={this.pageUp} />
				</div>
			</div>
		);
	}
}