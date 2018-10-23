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

	let carousel1 = props.cards.filter((card) => {
		return card.tags.includes("Pizza");
	});

	let carousel2 = props.cards.filter((card) => {
		return card.tags.includes("newrelease");
	});

	return (
		<div className='home'>
			<Hero cards={props.cards} openAppShowcase={props.openAppShowcase} />
			<Carousel tag="Pizza" cards={carousel1} openAppShowcase={props.openAppShowcase} seeMore={props.seeMore} addApp={props.addApp} removeApp={props.removeApp} addTag={props.addTag} />
			<Carousel tag="newrelease" cards={carousel2} openAppShowcase={props.openAppShowcase} seeMore={props.seeMore} addApp={props.addApp} removeApp={props.removeApp} addTag={props.addTag} />
		</div>
	);
}

export default Home;