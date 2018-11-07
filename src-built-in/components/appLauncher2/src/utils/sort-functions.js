import storeActions from '../stores/StoreActions'

export default {
	Alphabetical: (list) => {
		return list.sort((a, b) => {
			return a.name > b.name
		})
	},
	Recent: (list) => {
		// dummy sorting
		// reverse the above
		return list.sort((a, b) => {
			return a.name < b.name
		})
	},
	Favorites: (list) => {
		const favorites = storeActions.getSingleFolder('Favorites').apps
		return list.sort((a, b) => {
			return Boolean(favorites[a.appID]) < Boolean(favorites[b.appID])
		})
	}
}