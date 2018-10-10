/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
/**
 * This component is the name of a component and a pin that will pin that component to all toolbars.
 *
 */
import React from "react";
import ReactDOM from 'react-dom';
import * as storeExports from "./stores/appCatalogStore";

//components
import Hero from './components/Hero';
//import Carousel from './components/Carousel';

//style
import '../appCatalog2.css';

export default class AppCatalog extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			cards: [
				{
					"title": "New App",
					"message": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas feugiat orci mi. Nulla facilisi. In vel enim eget felis euismod efficitur quis quis tortor."
				},
				{
					"title": "New App 2",
					"message": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris ac dapibus dui, vitae lobortis metus. Fusce suscipit augue vel enim faucibus, nec volutpat ex tincidunt. Ut eu turpis eleifend, commodo."
				}
			]
		};
	}
	bindCorrectContext() {

	}
	render() {
		return (
			<div className="appCatalog">
				<Hero cards={this.state.cards} />
			</div>
		);
	}
}

FSBL.addEventListener("onReady", function () {

	storeExports.Actions.initialize(function (store) {
		ReactDOM.render(
			<AppCatalog />
			, document.getElementById("bodyHere"));
	});
});