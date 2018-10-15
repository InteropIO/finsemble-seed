export default {
	'Alphabetical' : (list) => {
		return list.sort((a, b) => {
			return a.friendlyName > b.friendlyName
		})
	},
	'Recent' : (list) => {
		// dummy sorting
		// reverse the above
		return list.sort((a, b) => {
			return a.friendlyName < b.friendlyName
		})	
	},
	'Favorites': (list) => {
		return list
	}
}