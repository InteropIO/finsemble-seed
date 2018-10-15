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

const Home = props => {

	let carousel1 = props.actualCards.filter((card) => {
		return card.tags.includes("Pizza");
	});

	let carousel2 = props.actualCards.filter((card) => {
		return card.tags.includes("newrelease");
	});

	return (
		<div>
			<Hero cards={props.actualCards} />
			<Carousel tag="Pizza" cards={carousel1} />
			<Carousel tag="New Releases" cards={carousel2} />
		</div>
	);
}

export default Home;