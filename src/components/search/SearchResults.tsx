import * as React from "react";
import { SearchProviderResults } from "./SearchProviderResults";
import { SearchBestMatch } from "./SearchBestMatch";
import { useSearch } from "../../../node_modules/@finsemble/finsemble-ui/react/hooks/useSearch";
// import "../../../node_modules/@finsemble/finsemble-ui/react/assets/assets/css/menus.css";


export const SearchResults: React.FunctionComponent = () => {
	const { searchResults, searchQuery } = useSearch();

	// If we had a response from the search client
	if (searchResults?.length) {
		return (
			// pull out best match into its own component.
			<div className="search-provider-results">
				<SearchBestMatch />
				{searchResults.map((r, i) => (
					<SearchProviderResults key={i} providerResponse={r} />
				))}
			</div>
		);
		// If we had no response, but we have a valid searchQuery
	} else {
		const message = searchQuery && searchQuery !== "" ? "No results" : "Results will display here";

		return <div className="menu-item no-hover informational-state">{message}</div>;
	}
};
