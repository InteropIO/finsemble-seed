const form = document.forms.configs

FSBL.addEventListener('onReady', () => {
	// Get the current configurations from localstorage
	initialize()

	// Attach events
	form.addEventListener('submit', saveHandler)
})

function saveHandler() {
	const formData = new FormData(form)
	const configs = {}
	try {
		const components = formData.get('comps')
		const menus = formData.get('menus')
		const cssOverridePath = formData.get('cssOverridePath')

		if (components.length > 0) {
			configs.components = JSON.parse(components)
		}

		if (menus.length > 0) {
			configs.menus = JSON.parse(menus)
		}

		if (cssOverridePath.length > 0) {
			configs.cssOverridePath = cssOverridePath
		}
	} catch (e) {
		alert('Invalid input.')
		return
	}

	FSBL.Clients.StorageClient.save(
		{
			topic: 'user',
			key: 'config',
			value: configs
		},
		() => alert('Saved.'))
}

function initialize() {
	FSBL.Clients.StorageClient.get(
		{
			topic: 'user',
			key: 'config'
		},
		(error, data) => {
			if (data) {
				form.elements.comps.value = JSON.stringify(data.components) || ''
				form.elements.menus.value = JSON.stringify(data.menus) || ''
				form.elements.cssOverridePath.value = data.cssOverridePath || ''
			}
		})
}
