import storeActions from '../stores/StoreActions'

export default {
	/**
	 * Sorts list alphabetically
	 */
	Alphabetical: (list) => {
		return list.sort((a, b) => {
			return a.name > b.name
		})
	},
	/**
	 * @todo We will implement this later once we have a 
	 * way to detect when was the last time an app was launched
	 */
	/* Recent: (list) => {
		// dummy sorting
		// reverse the above
		return list.sort((a, b) => {
			return a.name < b.name
		})
	},
	*/
	/**
	 * Sorts a list of application by Favorites.
	 * It gets a list of apps from Favorites folder
	 * then in the sort function, it checks where a, b apps
	 * are in favorite folder or not, giving a lower index
	 * for apps that are in Favorite folder
	 */
	Favorites: (list) => {
		const favorites = storeActions.getSingleFolder('Favorites').apps
		return list.sort((a, b) => {
			return Boolean(favorites[a.appID]) < Boolean(favorites[b.appID])
		})
	}
}