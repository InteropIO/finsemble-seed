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
 * @param {func} props.openAppShowcase Opens the AppShowcase page for a selected app
 * @param {func} props.seeMore Adds a filtering tag
 * @param {func} props.addApp Adds an app to the local finsemble
 * @param {func} props.removeApp Removes an app from local finsemble
 */
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
			<Carousel tag="Pizza" cards={carousel1} openAppShowcase={props.openAppShowcase} seeMore={props.seeMore} addApp={props.addApp} removeApp={props.removeApp} addTag={props.seeMore} />
			<Carousel tag="newrelease" cards={carousel2} openAppShowcase={props.openAppShowcase} seeMore={props.seeMore} addApp={props.addApp} removeApp={props.removeApp} addTag={props.seeMore} />
		</div>
	);
}

export default Home;