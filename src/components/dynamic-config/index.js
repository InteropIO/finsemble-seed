(() => {
	"use strict";

	const form = document.forms.configs

	// Event handler for tab button clicks
	const tabHandler = (e) => {
		const id = e.target.id;

		document.getElementById("componentsGroup").style = `display: ${id === "componentsBtn" ? "block" : "none"}`;
		document.getElementById("menusGroup").style = `display: ${id === "menusBtn" ? "block" : "none"}`;
		document.getElementById("workspacesGroup").style = `display: ${id === "workspacesBtn" ? "block" : "none"}`;
		document.getElementById("styleGroup").style = `display: ${id === "styleBtn" ? "block" : "none"}`;
		document.getElementById("servicesGroup").style = `display: ${id === "servicesBtn" ? "block" : "none"}`;
	}

	FSBL.addEventListener("onReady", () => {
		// Get the current configurations from local storage
		initialize();

		// Attach events
		form.addEventListener("submit", saveHandler);
		form.addEventListener("reset", initialize);

		document.getElementById("import").onclick = importConfig;
    document.getElementById("browse").addEventListener("change", browseFiles)
		document.getElementById("export").onclick = exportConfig;
		document.getElementById("componentsBtn").onclick = tabHandler;
		document.getElementById("menusBtn").onclick = tabHandler;
		document.getElementById("workspacesBtn").onclick = tabHandler;
		document.getElementById("stylesBtn").onclick = tabHandler
		document.getElementById("servicesBtn").onclick = tabHandler
	});

	const getConfigFromForm = () => {
		const formData = new FormData(form);
		const newConfig = {};
		try {
			const components = formData.get("components");
			const menus = formData.get("menus");
			const workspaces = formData.get("workspaces");
			const cssOverridePath = formData.get("style");
			const services = formData.get("services");

			if (components.length > 0) {
				newConfig.components = JSON.parse(components);
			}

			if (menus.length > 0) {
				newConfig.menus = JSON.parse(menus);
			}

			if (workspaces.length > 0) {
				newConfig.workspaces = JSON.parse(workspaces);
			}

			if (cssOverridePath.length > 0) {
				newConfig.cssOverridePath = cssOverridePath;
			}

			if (services.length > 0) {
				newConfig.services = JSON.parse(services);
			}
		} catch (e) {
			alert("Invalid input.");
			return;
		}

		return newConfig;
	}

	const filterComponents = (inputComponents) => {
		// Filter out system components. If a customer wants to override a presentation element with their own, they need to
		// make sure not to set component.category === "system"
		const components = {};
		Object.keys(inputComponents).forEach((componentName) => {
			const component = inputComponents[componentName];
			if (component && (!component.component || (component.component.category !== "system"))) {
				components[componentName] = component;
			}
		});

		return components;
	}

	const saveHandler = () => {
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

				const components = filterComponents(finsemble.components);

				// Configuration successfully applied, save for user config.
				FSBL.Clients.StorageClient.save(
					{
						topic: "user",
						key: "config",
						value: {
							components: components,
							menus: finsemble.menus,
							workspaces: finsemble.workspaces,
							cssOverridePath: finsemble.cssOverridePath,
							services: newConfig.services
						}
					},
					() => alert("Saved."));
			}
		)
	}

	const initialize = () => {
		FSBL.Clients.ConfigClient.getValue(
			{
				field: "finsemble"
			},
			(error, data) => {
				if (error) {
					FSBL.Clients.Logger.error(error);
					return;
				}

				if (data) {
					const components = filterComponents(data.components);
					form.elements.components.value = JSON.stringify(components, null, "\t") || "";
					form.elements.menus.value = JSON.stringify(data.menus, null, "\t") || "";
					form.elements.workspaces.value = JSON.stringify(data.workspaces, null, "\t") || "";
					form.elements.style.value = data.cssOverridePath || "";
				}

				FSBL.Clients.StorageClient.get(
					{
						topic: "user",
						key: "config"
					}, (err, userData) => {
						if (err) {
							FSBL.Clients.Logger.error(err);
							return;
						}

						form.elements.services.value =
							userData && userData.services ? JSON.stringify(userData.services, null, "\t") : "{}";
					});
			});
	}

  const browseFiles = (event) => {
    console.log('Importing file')
    const element = event.srcElement
    if (!element.files || !element.files.length) {
      return
    }
    const reader = new FileReader()
    reader.onload = function (event) {
      const formData = new FormData(form)
      const output = event.target.result
      formData.set("components", output)
      console.log(formData.get("components"))
    }
    reader.readAsText(element.files[0])
  }

	const importConfig = () => {
		const formData = new FormData(form);
		const importURL = formData.get("importConfig");

		if (!importURL || (importURL.length === 0)) {
			// No URL, return
			return;
		}

		fetch(importURL)
			.then((res) => {
				if (res.status !== 200) {
					throw res;
				}

				return res.json();
			})
			.then((data) => {
				// Import config
				if (data.components && (typeof (data.components)) === "object") {
					let components = JSON.parse(form.elements.components.value);
					components = Object.assign(components, data.components);
					form.elements.components.value = JSON.stringify(components, null, "\t");
				}

				if (data.services && (typeof (data.services)) === "object") {
					let services = JSON.parse(form.elements.services.value);
					services = Object.assign(services, data.services);
					form.elements.services.value = JSON.stringify(services, null, "\t");
				}
			})
			.then(() => {
				form.elements.importConfig.value = "";
			})
			.catch((err) => {
				FSBL.Clients.Logger.error(err);
				alert(`Error fetching config from ${importURL}`);
			});
	}

	const download = (filename, text) => {
		const element = document.createElement("a");
		element.setAttribute("href", `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`);
		element.setAttribute("download", filename);

		element.style.display = "none";

		document.body.appendChild(element);

		element.click();

		document.body.removeChild(element);
	}

	const exportConfig = () => {
		const newConfig = getConfigFromForm();
		const configStr = JSON.stringify(newConfig, null, "\t")

		// Start file download.
		download("userConfig.json", configStr);
	}

})();
