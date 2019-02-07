import storeActions from '../stores/StoreActions'

export default {
	/**
	 * Sorts list alphabetically
	 */
	Alphabetical: (list) => {
		return list.sort((a, b) => {
			return a.name.toLowerCase() > b.name.toLowerCase()
		})
	},
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