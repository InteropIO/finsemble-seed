import * as React from "react";
import { SearchResult } from "./SearchResult";
import { SearchProviderResponse, SearchResultType } from "../../../node_modules/@finsemble/finsemble-ui/react/types/searchTypes";
import { useSearch } from "../../../node_modules/@finsemble/finsemble-ui/react/hooks/useSearch.js";

/**
 * Iterates through the responses from every search provider
 * and returns the item with the highest score.
 * Half of the time this makes sense. The other half
 * it doesn't make sense. It's all built on Fuse JS and how
 * it grades the 'score' of a query to an entity.
 */
const findBestMatch = (searchProviderResponses: SearchProviderResponse[] | null) => {
	if (searchProviderResponses) {
		let bestMatch: SearchResultType | null = null;
		searchProviderResponses.forEach((providerInfo: SearchProviderResponse) => {
			providerInfo?.data?.forEach((result: SearchResultType) => {
				if (bestMatch === null) {
					bestMatch = result;
				} else if (result.score < bestMatch.score) {
					// Note, lowest score is best score
					bestMatch = result;
				}
			});
		});
		return bestMatch;
	}
	return null;
};

/**
 * Simple component that renders a menu item for the entity that
 * best matches the user's query.
 */
export const SearchBestMatch = () => {
	const { searchResults, searchQuery, resetSearch } = useSearch();
	const bestMatchData = findBestMatch(searchResults);
	if (!bestMatchData) return null;

	return (
		<div>
			<div className="search-title">Best Match</div>
			<SearchResult resetSearch={resetSearch} data={bestMatchData} searchQuery={searchQuery} />
		</div>
	);
};
