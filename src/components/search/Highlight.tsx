import * as React from "react";

const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string

/**
 * Highlights matching areas of a query against a piece of text, and then renders them
 * on the screen with a highlighted class. The matching is case insensitive.
 *
 * This takes a regular expression string. If the string isn't a valid regular expression
 * then it defaults to a simple (case insensitive) search string, ignoring the special characters.
 *
 */
export const Highlight = (props: { matchAgainst: string; text: string }) => {
	const { matchAgainst, text } = props;

	let regex: RegExp | string | undefined;
	try {
		regex = new RegExp(`(${matchAgainst})`, "gi");
	} catch (e) {
		regex = matchAgainst;
	}

	if (matchAgainst && text) {
		return (
			<>
				{text.split(regex).map((part: string, i: number) => {
					const highlightIt = part.toLowerCase() === matchAgainst?.toLowerCase();
					return (
						<span key={i} className={highlightIt ? "highlight" : ""}>
							{part}
						</span>
					);
				})}
			</>
		);
	}

	return <React.Fragment>{text}</React.Fragment>;
};
