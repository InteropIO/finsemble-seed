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
import AppCard from './AppCard';

const AppResults = props => {

	//Filter cards by tags
	let cardsForShowcase = [];
	if (props.tags && Array.isArray(props.tags) && props.tags.length > 0) {
		cardsForShowcase = props.cards.filter((card) => {
			for (let i = 0; i < props.tags.length; i++) {
				let tagToSearchFor = props.tags[i];
				if (card.tags.includes(tagToSearchFor)) return true;
				else return false;
			}
		});
	} else {
		cardsForShowcase = props.cards;
	}


	let cardRows = [];
	let cardsInRow = [];
	for (let i = 0; i < cardsForShowcase.length; i++) {
		let card = cardsForShowcase[i];

		if (cardsInRow.length === 4) {
			cardRows.push(cardsInRow);
			cardsInRow = [];
		}

		cardsInRow.push(
			<td key={"row-" + cardRows.length + "-card-" + i}>
				<AppCard {...card} openAppShowcase={props.openAppShowcase} addApp={this.props.addApp} />
			</td>
		);
	}
	if (cardRows.length === 0) {
		cardRows.push(cardsInRow);
	}


	return (
		<div className='app-showcase'>
			{cardsForShowcase.length === 0 ? (
				<h3 className="app-showcase-no-results">
					No results found. Please try again.
				</h3>
			)
				:
			(
				<table>
					<tbody>
						{cardRows.map((row, i) => {
							return (
								<tr key={"tablerow-" + i}>
									{row}
								</tr>
							);
						})}
					</tbody>
				</table>
			)}
		</div>
	);
}

export default AppResults;