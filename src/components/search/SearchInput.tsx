import * as React from "react";
import { createRef } from "react";
import { useSearch } from "../../../node_modules/@finsemble/finsemble-ui/react/hooks/useSearch.js";
/**
 * This is the search input field for the search menu.
 * It will trigger calls to the searchMenu via the hook passed in
 * through props.
 */
export const SearchInput = () => {
	const { searchQuery } = useSearch();
	// the ref is needed so we can provide focus after clearing the search.
	const textInputRef: any = createRef();
	const { updateQuery, resetSearch } = useSearch();

	const onClearSearchClicked = () => {
		resetSearch();
		textInputRef.current.focus();
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		updateQuery(e.target.value);
	};

	return (
		<div className="menu-item no-hover">
			<div className="menu-item-row">
				<span className="search-icon-wrapper">
					<i className="ff-search" />
				</span>
				<input
					ref={textInputRef}
					type="text"
					placeholder="Search"
					className="search-input"
					value={searchQuery || ""}
					autoFocus
					onChange={handleInputChange}
				/>
				{searchQuery && (
					<span className="clear-search menu-item-row-push-right" onClick={onClearSearchClicked}>
						<i className="ff-close" />
					</span>
				)}
			</div>
		</div>
	);
};
