import * as React from "react";
import { Menu,MenuProps } from "../../../node_modules/@finsemble/finsemble-ui/react/components/menu/Menu"
import { SearchResults } from "./SearchResults";
import { SearchInput } from "./SearchInput";
import "../../assets/css/search.css";

const Search: React.FunctionComponent<MenuProps> = ({
	width = 293,
	className = "search-menu",
	id = "SearchMenu",
	...otherProps
}) => {
	const completeProps = {
		...otherProps,
		width,
		className,
		id,
		title: otherProps.title ?? <i className="ff-search"></i>,
	};

	return (
		<Menu {...completeProps}>
			<SearchInput />
			<SearchResults />
		</Menu>
	);
};
export { Search };
