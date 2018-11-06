export default {
	'Alphabetical' : (list) => {
		return list.sort((a, b) => {
			return a.name > b.name
		})
	},
	'Recent' : (list) => {
		// dummy sorting
		// reverse the above
		return list.sort((a, b) => {
			return a.name < b.name
		})
	},
	'Favorites': (list) => {
		return list
	}
}