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
	let index = 0;
	for (let i = 0; i < cardsForShowcase.length; i++) {
		let card = cardsForShowcase[i];

		cardsInRow.push(
			<td key={"row-" + i + "-card-" + index}>
				<AppCard {...card} openAppShowcase={props.openAppShowcase} />
			</td>
		);
		if (index < 4) {
			index++;
		} else {
			index = 0;
			cardsInRow = [];
		}
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