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
import EmptyResults from './EmptyResults';
import AppCard from './AppCard';

const AppResults = props => {

	//Filter cards by tags
	let cardsForShowcase = [];
	if (props.tags && Array.isArray(props.tags) && props.tags.length > 0) {
		cardsForShowcase = props.cards.filter((card) => {
			for (let i = 0; i < props.tags.length; i++) {
				let tagToSearchFor = props.tags[i];
				if (card.tags.includes(tagToSearchFor)) return true;
			}
		});
	} else {
		cardsForShowcase = props.cards;
	}

	let cardRows = [];
	let cardsInRow = [];
	for (let i = 0; i < cardsForShowcase.length; i++) {
		let card = cardsForShowcase[i];
		let name = card.title || card.name;

		if (cardsInRow.length === 4) {
			cardRows.push(cardsInRow);
			cardsInRow = [];
		}

		let key = "card-" + i + "-" + name.toLowerCase();

		cardsInRow.push(
			<td key={key}>
				<AppCard {...card} openAppShowcase={props.openAppShowcase} addApp={props.addApp} removeApp={props.removeApp} addTag={props.addTag} />
			</td>
		);
	}
	if (cardRows.length === 0) {
		cardRows.push(cardsInRow);
	}

	if (cardsForShowcase.length === 0) return (<EmptyResults />);
	else {
		return (
			<div className='app-results'>
				<table className='app-results-table'>
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
			</div>
		);
	}
}

export default AppResults;