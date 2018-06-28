const form = document.forms.configs

document.getElementById("menusGroup").style = "display: none";
document.getElementById("workspacesGroup").style = "display: none";
document.getElementById("styleGroup").style = "display: none";
document.getElementById("servicesGroup").style = "display: none";

document.getElementById("componentsBtn").onclick = () => {
	document.getElementById("componentsGroup").style = "display: block";
	document.getElementById("menusGroup").style = "display: none";
	document.getElementById("workspacesGroup").style = "display: none";
	document.getElementById("styleGroup").style = "display: none";
	document.getElementById("servicesGroup").style = "display: none";
}

document.getElementById("menusBtn").onclick = () => {
	document.getElementById("componentsGroup").style = "display: none";
	document.getElementById("menusGroup").style = "display: block";
	document.getElementById("workspacesGroup").style = "display: none";
	document.getElementById("styleGroup").style = "display: none";
	document.getElementById("servicesGroup").style = "display: none";
}

document.getElementById("workspacesBtn").onclick = () => {
	document.getElementById("componentsGroup").style = "display: none";
	document.getElementById("menusGroup").style = "display: none";
	document.getElementById("workspacesGroup").style = "display: block";
	document.getElementById("styleGroup").style = "display: none";
	document.getElementById("servicesGroup").style = "display: none";
}

document.getElementById("stylesBtn").onclick = () => {
	document.getElementById("componentsGroup").style = "display: none";
	document.getElementById("menusGroup").style = "display: none";
	document.getElementById("workspacesGroup").style = "display: none";
	document.getElementById("styleGroup").style = "display: block";
	document.getElementById("servicesGroup").style = "display: none";
}

document.getElementById("servicesBtn").onclick = () => {
	document.getElementById("componentsGroup").style = "display: none";
	document.getElementById("menusGroup").style = "display: none";
	document.getElementById("workspacesGroup").style = "display: none";
	document.getElementById("styleGroup").style = "display: none";
	document.getElementById("servicesGroup").style = "display: block";
}

FSBL.addEventListener('onReady', () => {
	// Get the current configurations from localstorage
	initialize()

	// Attach events
	form.addEventListener('submit', saveHandler)
	form.addEventListener('reset', initialize)
})

function saveHandler() {
	const formData = new FormData(form)
	const newConfig = {}
	try {
		const components = formData.get('comps')
		const menus = formData.get('menus')
		const workspaces = formData.get('workspaces')
		const cssOverridePath = formData.get('style')
		const services = formData.get('services')

		if (components.length > 0) {
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

		if (services.length > 0) {
			newConfig.services = JSON.parse(services)
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
						cssOverridePath: finsemble.cssOverridePath,
						services: newConfig.services
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
				form.elements.style.value = data.cssOverridePath || ''
			}

			FSBL.Clients.StorageClient.get(
				{
					topic: 'user',
					key: 'config'
				}, (err, userData) => {
					debugger;
					if (err) {
						FSBL.Clients.Logger.error(err);
						return;
					}

					form.elements.services.value = JSON.stringify(userData.services, null, '\t') || "{}"
				})
		})
}
