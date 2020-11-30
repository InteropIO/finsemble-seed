import * as React from "react";
import { SearchResult } from "./SearchResult";
import { SearchProviderResponse, SearchResultType } from "../../../node_modules/@finsemble/finsemble-ui/react/types/searchTypes";
import { useSearch } from "../../../node_modules/@finsemble/finsemble-ui/react/hooks/useSearch.js";
export const SearchProviderResults: React.FunctionComponent<{
	providerResponse: SearchProviderResponse;
}> = ({ providerResponse }) => {
	const { searchQuery, resetSearch } = useSearch();

	const clickResetSearch = () => {
		resetSearch();
	};
	// Removes empty results then sorts by *lowest* score (search results are retuned from Finsemble where lowest is best)
	// This uses fuse.js which uses the "bitap" algorithm
	const providerResults = providerResponse?.data
		?.filter((r: SearchResultType) => r)
		.sort((a: SearchResultType, b: SearchResultType) => a.score - b.score);

	return (
		<>
			{providerResponse && <div className="search-title">{providerResponse.provider.displayName}</div>}
			{providerResults?.map((individualResult, i: number) => (
				<SearchResult key={i} resetSearch={clickResetSearch} searchQuery={searchQuery} data={individualResult} />
			))}
		</>
	);
};
