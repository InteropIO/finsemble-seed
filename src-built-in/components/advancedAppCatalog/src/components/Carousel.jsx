/*!
* Copyright 2017 - 2020 by ChartIQ, Inc.
* All rights reserved.
*/
import React, { Component } from "react";

//data
import storeActions from '../stores/storeActions';

//components
import AppCard from './AppCard';
/**
 * A carousel of AppCards
 * @param {object} props Component props
 * @param {array} props.cards An array of AppCards to display in a carousel
 * @param {string} props.tag The carousel's tag (title)
 * @param {func} props.openAppShowcase Parent function to show the AppShowcase for the selected card
 */
export default class Carousel extends Component {
	constructor(props) {
		super(props);
		this.state = {
			firstIndex: 0,
			titleHighlighted: false
		}
		this.bindCorrectContext();
		if (this.props.cards.length < 3) this.notEnoughCards();
	}
	bindCorrectContext() {
		this.pageUp = this.pageUp.bind(this);
		this.pageDown = this.pageDown.bind(this);
		this.highlightTitle = this.highlightTitle.bind(this);
		this.seeMore = this.seeMore.bind(this);
		this.notEnoughCards = this.notEnoughCards.bind(this);
		this.buildCarousel = this.buildCarousel.bind(this);
	}
	/**
	 * Pages through the carousel by one card (right)
	 */
	pageUp() {
		let index = this.state.firstIndex;

		//If increasing the carousel's first index will move beyond the array's limits, we reset back to zero
		if (index + 1 <= this.props.cards.length - 1) {
			index++;
		}

		this.setState({
			firstIndex: index
		});
	}
	/**
	 * Pages through the carousel by one card (left)
	 */
	pageDown() {
		let index = this.state.firstIndex;

		//If increasing the carousel's first index will move beyond the array's limits, we reset back to zero
		if (index - 1 >= 0) {
			index--;
		}

		this.setState({
			firstIndex: index
		});
	}
	/**
	 * Toggles the highlight on a carousel's title. When a user mouses over, we want to style it so its obvious its a link
	 * @param {*} highlight
	 */
	highlightTitle(highlight) {
		this.setState({
			titleHighlighted: highlight
		});
	}
	/**
	 * Calls the parents seeMore function, which will add the selected tag as a filter
	 */
	seeMore() {
		storeActions.addTag(this.props.tag);
	}
	/**
	 * Spits out a warning if the number of cards supplied to the carousel is < 3
	 */
	notEnoughCards() {
		console.warn('Less than 3 card supplied. This carousel will not display optimally');
	}
	/**
	 * Function to build the items in the carousel
	 */
	buildCarousel() {
		let { cards } = this.props;
		let firstCard = this.state.firstIndex;

		let displayCards = [];
		for (let i = 0; i < 3; i++) {
			if (firstCard >= 0 && firstCard <= cards.length - 1) {
				displayCards.push(cards[firstCard]);
				firstCard++;
			}
		}

		return displayCards;
	}
	render() {

		let displayCards = this.buildCarousel();
		let titleClass = "carousel-title";
		if (this.state.titleHighlighted) titleClass += " highlight";

		let chevron_left_style = 'ff-adp-chevron-left', chevron_right_style = 'ff-adp-chevron-right';
		let left_click = this.pageDown, right_click = this.pageUp;

		if (this.state.firstIndex + 2 >= this.props.cards.length - 1) {
			chevron_right_style += " disabled";
			right_click = Function.prototype;
		}

		if (this.state.firstIndex === 0) {
			chevron_left_style += " disabled";
			left_click = Function.prototype;
		}

		return (
			<div className="carousel-main">
				<div className="carousel-header">
					<div className={titleClass} onClick={this.seeMore} onMouseEnter={this.highlightTitle.bind(this, true)} onMouseLeave={this.highlightTitle.bind(this, false)}>{this.props.tag[0].toUpperCase() + this.props.tag.substring(1)}</div>
					<button className="see-more" onClick={this.seeMore}><span className='button-label'>See More</span></button>
				</div>
				<div className="carousel-content">
					<i className={chevron_left_style} onClick={left_click} />
					{displayCards.map((card, i) => {
						return (
							<AppCard key={(card.title || card.name) + i} {...card} viewAppShowcase={this.props.viewAppShowcase} />
						);
					})}
					<i className={chevron_right_style} onClick={right_click} />
				</div>
			</div>
		);
	}
}