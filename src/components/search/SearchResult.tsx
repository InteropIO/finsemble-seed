import * as React from "react";
import { MenuItem } from "../../../node_modules/@finsemble/finsemble-ui/react/components/menu/MenuItem"
import { Icon } from "../../../node_modules/@finsemble/finsemble-ui/react/components/icon/Icon";
import { Highlight } from "./Highlight";
import { SearchQuery } from "../../../node_modules/@finsemble/finsemble-ui/react/types/searchTypes";
import { Favorite } from "../../../node_modules/@finsemble/finsemble-ui/react/types/favoriteTypes";
import { FavoriteMaker } from "../../../node_modules/@finsemble/finsemble-ui/react/components/favorites/FavoriteMaker";
export const SearchResult = (props: { data: any; searchQuery: SearchQuery; resetSearch: () => void }) => {
	const { data, searchQuery, resetSearch } = props;

	// Will trigger the action associated with the item
	// (e.g., loading a workspace, spawning a component)
	const onSeachResultClicked = () => {
		FSBL.Clients.SearchClient.invokeItemAction(data, data.actions[0]);
		resetSearch();
	};

	// Default icon to be based on initials
	let icon: any = {
		imageType: "initials",
		name: data.name,
		category: data.type,
	};

	// If the search results return iconography then use convert and use it
	if (data.icon) {
		icon.imageType = data.icon.type;
		icon.path = data.icon.path;
	}

	const favorite: Favorite = {
		id: data.name,
		name: data.name,
		category: data.type,
		icon: icon,
	};

	return (
		<MenuItem onClick={onSeachResultClicked}>
			<div className="menu-item-row">
				<Icon {...icon} />
				<Highlight text={data.name} matchAgainst={searchQuery || ""} />
				<FavoriteMaker className="menu-item-row-push-right" {...favorite} />
			</div>
		</MenuItem>
	);
};
