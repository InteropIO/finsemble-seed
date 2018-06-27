const form = document.forms.configs

FSBL.addEventListener('onReady', () => {
	// Get the current configurations from localstorage
	initialize()

	// Attach events
	form.addEventListener('submit', saveHandler)
})

function saveHandler() {
	const formData = new FormData(form)
	const newConfig = {}
	try {
		const components = formData.get('comps')
		const menus = formData.get('menus')
		const workspaces = formData.get('workspaces')
		const cssOverridePath = formData.get('cssOverridePath')

		if (components.length > 0) 
		{
			newConfig.components = JSON.parse(components)
		}

		if (menus.length > 0) {
			newConfig.menus = JSON.parse(menus)
		}

		if (workspaces.length > 0) {
			newConfig.workspaces = JSON.parse(workspaces)
		}

		if (cssOverridePath.length > 0) {
			newConfig.cssOverridePath = cssOverridePath
		}
	} catch (e) {
		alert('Invalid input.')
		return
	}

	// Apply configuration to Finsemble
	// TODO: Should we have options for overwrite and replace?
	FSBL.Clients.ConfigClient.processAndSet(
		{
			newConfig: newConfig,
			overwrite: true,
			replace: true
		},
		(err, finsemble) => {
			if (err) {
				alert(err);
				return;
			}

			// Configuration successfully applied, save for user config.
			FSBL.Clients.StorageClient.save(
				{
					topic: 'user',
					key: 'config',
					value: {
						components: finsemble.components,
						menus: finsemble.menus,
						workspaces: finsemble.workspaces,
						cssOverridePath: finsemble.cssOverridePath
					}
				},
				() => alert('Saved.'))
		}
	)
}

function initialize() {
	FSBL.Clients.ConfigClient.getValue({ field: 'finsemble' },
		(error, data) => {
			if (error) {
				FSBL.Clients.Logger.error(error);
				return;
			}

			if (data) {
				form.elements.comps.value = JSON.stringify(data.components, null, '\t') || ''
				form.elements.menus.value = JSON.stringify(data.menus, null, '\t') || ''
				form.elements.workspaces.value = JSON.stringify(data.workspaces, null, '\t') || ''
				form.elements.cssOverridePath.value = data.cssOverridePath || ''
			}
		})
}
