(() => {
	const Vue = window.Vue

	FSBL.addEventListener('onReady', initializeApp)

	function initializeApp() {

		(() => {

			Vue.component('cq-main', {
				data,
				methods: {
					exportConfig,
					importConfig
				},
				mounted,
				template: `
					<div class="container">
						<div id="top-buttons" class="form-group">
							<button
								class="btn"
								id="componentsBtn"
								v-on:click="tab = 'components'">
								Components
							</button>
							<button
								class="btn"
								id="menusBtn"
								v-on:click="tab = 'menus'">
								Menu
							</button>
							<button
								class="btn"
								id="workspacesBtn"
								v-on:click="tab = 'workspaces'">
								Workspaces
							</button>
							<button
								class="btn"
								id="stylesBtn"
								v-on:click="tab = 'styles'">
								Style
							</button>
							<button
								class="btn"
								id="servicesBtn"
								v-on:click="tab = 'services'">
								Services
							</button>
						</div>
						<form name="configs" action="javascript:void(0)">
							<div
								class="form-group"
								id="componentsGroup"
								v-if="tab === 'components'">
								<label for="components">Components</label>
								<textarea id="components" class="form-control" rows="15" name="components"></textarea>
							</div>

							<div
								class="form-group"
								id="menusGroup"
								v-if="tab === 'menus'">
								<label for="menus">Menu</label>
								<textarea id="menus" class="form-control" rows="15" name="menus"></textarea>
							</div>

							<div
								class="form-group"
								id="workspacesGroup"
								v-if="tab === 'workspaces'">
								<label for="workspaces">Workspaces</label>
								<textarea id="workspaces" class="form-control" rows="15" name="workspaces"></textarea>
							</div>

							<div
								class="form-group"
								id="styleGroup"
								v-if="tab === 'styles'">
								<label for="style">Style URL</label>
								<input id="style" class="form-control" name="style" />
							</div>

							<div
								class="form-group"
								id="servicesGroup"
								v-if="tab === 'services'">
								<label for="services">Services</label>
								<textarea id="services" class="form-control" rows="15" name="services"></textarea>
							</div>

							<!-- TODO: Get import button in line with import config field -->
							<div id="importConfigGroup" class="form-group">
								<label for="importConfig">Import Components/Services</label>
								<input id="importConfig" class="form-control" name="importConfig" />
								<button
									class="btn"
									id="import"
									name="import"
									type="button"
									v-on:click="importConfig">
									Import
								</button>
								<input
									class="btn"
									name="browse"
									type="file"
									id="browse"
									/>
							</div>

							<div id="bottom-buttons" class="form-group">
								<button
									class="btn"
									name="save"
									type="submit"
									id="submit">
									Save
								</button>
								<button
									class="btn"
									name="clear"
									type="reset"
									id="clear">
									Clear
								</button>
								<button
									class="btn"
									id="export"
									name="export"
									type="button"
									v-on:click="exportConfig">
									Export
								</button>
							</div>
						</form>
					</div>
				`
			})

			function data() {
				return {
					tab: 'components'
				}
			}

			function mounted() {

				// Get the current configurations from local storage
				initialize()

				// Attach events
				const form = document.forms.configs
				form.addEventListener("submit", saveHandler)
				form.addEventListener("reset", initialize)

				//document.getElementById("import").onclick = importConfig
				//document.getElementById("export").onclick = exportConfig
				document.getElementById("browse").addEventListener("change", browseFiles)

			}

			function getConfigFromForm() {
				const form = document.forms.configs
				const formData = new FormData(form)
				const newConfig = {}
				try {
					const components = formData.get("components")
					const menus = formData.get("menus")
					const workspaces = formData.get("workspaces")
					const cssOverridePath = formData.get("style")
					const services = formData.get("services")

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
					alert("Invalid input.")
					return
				}

				return newConfig
			}

			function filterComponents(inputComponents) {
				// Filter out system components. If a customer wants to override a presentation element with their own, they need to
				// make sure not to set component.category === "system"
				const components = {}
				Object.keys(inputComponents).forEach((componentName) => {
					const component = inputComponents[componentName]
					if (component && (!component.component || (component.component.category !== "system"))) {
						components[componentName] = component
					}
				})

				return components
			}

			function saveHandler() {
				// Apply configuration to Finsemble
				const newConfig = getConfigFromForm()

				// There was an error, return
				if (!newConfig) return

				// TODO: Should we have options for overwrite and replace?
				FSBL.Clients.ConfigClient.processAndSet(
					{
						newConfig: newConfig,
						overwrite: true,
						replace: true
					},
					(err, finsemble) => {
						if (err) {
							alert(err)
							return
						}

						const components = filterComponents(finsemble.components)

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
							() => alert("Saved."))
					}
				)
			}

			function initialize() {
				const form = document.forms.configs
				FSBL.Clients.ConfigClient.getValue(
					{
						field: "finsemble"
					},
					(error, data) => {
						if (error) {
							FSBL.Clients.Logger.error(error)
							return
						}

						if (data) {
							const components = filterComponents(data.components)
							form.elements.components.value = JSON.stringify(components, null, "\t") || ""
							form.elements.menus.value = JSON.stringify(data.menus, null, "\t") || ""
							form.elements.workspaces.value = JSON.stringify(data.workspaces, null, "\t") || ""
							form.elements.style.value = data.cssOverridePath || ""
						}

						FSBL.Clients.StorageClient.get(
							{
								topic: "user",
								key: "config"
							}, (err, userData) => {
								if (err) {
									FSBL.Clients.Logger.error(err)
									return
								}

								form.elements.services.value =
									userData && userData.services ? JSON.stringify(userData.services, null, "\t") : "{}"
							})
					})
			}

			function browseFiles(event) {
				const form = document.forms.configs
				console.log('Importing file')
				const element = event.srcElement
				if (!element.files || !element.files.length) {
					return
				}
				const reader = new FileReader()
				reader.onload = function onload(event) {
					const formData = new FormData(form)
					const output = event.target.result
					formData.set("components", output)
					console.log(formData.get("components"))
				}
				reader.readAsText(element.files[0])
			}

			function importConfig() {
				const form = document.forms.configs
				const formData = new FormData(form)
				const importURL = formData.get("importConfig")

				if (!importURL || (importURL.length === 0)) {
					// No URL, return
					return
				}

				fetch(importURL)
					.then((res) => {
						if (res.status !== 200) {
							throw res
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
							form.elements.services.value = JSON.stringify(services, null, "\t")
						}
					})
					.then(() => {
						form.elements.importConfig.value = ""
					})
					.catch((err) => {
						FSBL.Clients.Logger.error(err)
						alert(`Error fetching config from ${importURL}`)
					})
			}

			function download(filename, text) {
				const element = document.createElement("a")
				element.setAttribute("href", `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`)
				element.setAttribute("download", filename)

				element.style.display = "none"

				document.body.appendChild(element)

				element.click()

				document.body.removeChild(element)
			}

			function exportConfig() {
				const newConfig = getConfigFromForm()
				const configStr = JSON.stringify(newConfig, null, "\t")

				// Start file download.
				download("userConfig.json", configStr)
			}


		})() // main component iife

		new Vue({
			el: '#app'
		})

	} // initializeApp function

})() // root scope iife
