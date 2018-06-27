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
		const workspaces = formData.get('workspaces')
		const cssOverridePath = formData.get('cssOverridePath')

		if (components.length > 0) {
			configs.components = JSON.parse(components)
		}

		if (menus.length > 0) {
			configs.menus = JSON.parse(menus)
		}

		if (workspaces.length > 0) {
			configs.workspaces = JSON.parse(workspaces)
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
	FSBL.Clients.ConfigClient.getValue({field:'finsemble'},
		(error, data) => {
			debugger;
			if (error) {
				FSBL.Clients.Logger.error(error);
				return;
			}

			if (data) {
				form.elements.comps.value = JSON.stringify({ components: data.components }, null, '\t') || ''
				form.elements.menus.value = JSON.stringify({ menus: data.menus }, null, '\t') || ''
				form.elements.workspaces.value = JSON.stringify({ workspaces: data.workspaces }, null, '\t') || ''
				form.elements.cssOverridePath.value = data.cssOverridePath || ''
			}
		})
}
