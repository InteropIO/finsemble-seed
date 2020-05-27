import { isAppInFavorites } from './helpers';

export default {
	/**
	 * Sorts list by name alphabetically
	 */
	Alphabetical: (list) => {
		return list.sort((a, b) => a.name.localeCompare(b.name));
	},

	/**
	 * Sorts a list of application by Favorites.
	 * It gets a list of apps from Favorites folder
	 * then in the sort function, it checks where a, b apps
	 * are in favorite folder or not, giving a lower index
	 * for apps that are in Favorite folder
	 */
	Favorites: (list) => {
		return list.sort((a, b) => {
			const aInFavorites = isAppInFavorites(a.appID);
			const bInFavorites = isAppInFavorites(b.appID);
			// a component being in favorites means it is "less than" another component not in favorites, so return -1
			if (aInFavorites && !bInFavorites) 
			{
				return -1;
			}
			else if (!aInFavorites && bInFavorites)
			{
				return 1;
			}
			return a.name.localeCompare(b.name);
		});
	}
}
