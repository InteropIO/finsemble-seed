/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
/**
 * This component is the name of a component and a pin that will pin that component to all toolbars.
 *
 */
import React from "react";

//components
import Hero from './Hero';
import Carousel from './Carousel';

/**
 * Home page. Contains carousels and a hero component
 * @param {object} props Component props
 * @param {array} props.cards An Array of app information from FDC
 * @param {func} props.viewAppShowcase Opens the AppShowcase page for a selected app
 */
const Home = props => {

	let carousel1 = props.cards.filter((card) => {
		return card.tags.includes("Pizza");
	});

	let carousel2 = props.cards.filter((card) => {
		return card.tags.includes("app");
	});

	return (
		<div className='home'>
			<Hero cards={props.cards} viewAppShowcase={props.viewAppShowcase} />
			<Carousel tag="Pizza" cards={carousel1} viewAppShowcase={props.viewAppShowcase} />
			<Carousel tag="newrelease" cards={carousel2} viewAppShowcase={props.viewAppShowcase} />
		</div>
	);
}

export default Home;