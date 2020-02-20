/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import React from "react";

//components
import EmptyResults from "./EmptyResults";
import AppCard from "./AppCard";

/**
 * The results page. Shown when filter tags are applied, search text is entered, or both.
 * @param {object} props Component props
 * @param {array} props.tags Array of tags that are applied for filtering
 * @param {array} props.cards Array of app card objects (apps that come from FDC app directory)
 * @param {func} props.addApp See AppCard.jsx
 * @param {func} props.removeApp See AppCard.jsx
 * @param {func} props.openAppShowcase See AppCard.jsx
 * @param {func} props.addTag Parent function to add a filtering tag
 */
const AppResults = props => {

	/**
	 * Function to take the incoming apps and any filtering tags and filter the list.
	 * If there are no tags, we'll use all of the cards supplied
	 */
	const buildResultCards = () => {
		let cardsForShowcase = [];

		//Filter cards by tags
		if (props.tags && props.tags.length > 0) {
			cardsForShowcase = props.cards.filter((card) => {
				for (let i = 0; i < props.tags.length; i++) {
					let tagToSearchFor = props.tags[i];
					if (!card.tags.includes(tagToSearchFor)) return false;
				}
				return true;
			});
		} else {
			cardsForShowcase = props.cards;
		}

		return cardsForShowcase;
	};

	let cardsForShowcase = buildResultCards();

	/**
	 * Function to build the table of cards based on filtered information
	 */
	const getCardRows = () => {
		let cardRows = [];
		let cardsInRow = [];
		for (let i = 0; i < cardsForShowcase.length; i++) {
			let card = cardsForShowcase[i];
			let name = card.title || card.name;

			let key = "card-" + i + "-" + name.toLowerCase();

			cardsInRow.push(
				<td key={key}>
					<AppCard {...card} viewAppShowcase={props.viewAppShowcase} />
				</td>
			);

			if (cardsInRow.length === 3 || i === cardsForShowcase.length - 1) {
				cardRows.push(cardsInRow);
				cardsInRow = [];
			}
		}

		return cardRows;
	};

	if (cardsForShowcase.length === 0) return (<EmptyResults />);

	let cardRows = getCardRows();

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

};

export default AppResults;