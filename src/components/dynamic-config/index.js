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
	// Get the current configurations from local storage
	initialize()

	// Attach events
	form.addEventListener('submit', saveHandler)
	form.addEventListener('reset', initialize)
	document.getElementById('import').onclick = importConfig
	document.getElementById('export').onclick = exportConfig
})

function getConfigFromForm() {
	const formData = new FormData(form)
	const newConfig = {}
	try {
		const components = formData.get('components')
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

	return newConfig;
}

function saveHandler() {
	// Apply configuration to Finsemble
	const newConfig = getConfigFromForm();

	// There was an error, return
	if (!newConfig) return;

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
				form.elements.components.value = JSON.stringify(data.components, null, '\t') || ''
				form.elements.menus.value = JSON.stringify(data.menus, null, '\t') || ''
				form.elements.workspaces.value = JSON.stringify(data.workspaces, null, '\t') || ''
				form.elements.style.value = data.cssOverridePath || ''
			}

			FSBL.Clients.StorageClient.get(
				{
					topic: 'user',
					key: 'config'
				}, (err, userData) => {
					if (err) {
						FSBL.Clients.Logger.error(err);
						return;
					}

					form.elements.services.value = JSON.stringify(userData.services, null, '\t') || "{}"
				})
		})
}

function importConfig() {
	const formData = new FormData(form)
	const importURL = formData.get('importConfig')
	fetch(importURL)
		.then((res) => {
			if (res.status !== 200) {
				throw res;
			}

			return res.json()
		})
		.then((data) => {
			// Import config
			if (data.components && (typeof (data.components)) === "object") {
				let components = JSON.parse(components)
				components = Object.assign(components, data.components)
				form.elements.components.value = components
			}

			if (data.services && (typeof (data.services)) === "object") {
				let services = JSON.parse(form.elements.services.value)
				services = Object.assign(services, data.services)
				form.elements.services.value = JSON.stringify(services, null, '\t')
			}
		})
		.then(() => {
			form.elements.importConfig.value = ''
		})
		.catch((err) => {
			FSBL.Clients.Logger.error(err);
			alert(`Error fetching config from ${importURL}`);
		})
}

function download(filename, text) {
	var element = document.createElement('a');
	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
	element.setAttribute('download', filename);

	element.style.display = 'none';
	document.body.appendChild(element);

	element.click();

	document.body.removeChild(element);
}

function exportConfig() {
	const newConfig = getConfigFromForm();
	const configStr = JSON.stringify(newConfig, null, '\t')

	// Start file download.
	download("userConfig.json", configStr);
}