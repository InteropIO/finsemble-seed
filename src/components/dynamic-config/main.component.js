(() => {
	const util = window.util
	const Vue = window.Vue

	Vue.component('cq-main', {
		data: function data() {
			return {
				form: {
					components: '',
					menus: '',
					services: '',
					cssOverridePath: '',
					workspaces: ''
				},
				// Repositories are objects containing an array of components that
				// can be enabled or disabled. Each repository is generated from a
				// component config and given a unique id.
				repos: [],
				tab: 'components'
			}
		},
		methods: {
			loadFile,
			exportConfig,
			importConfig,
			removeRepo,
			resetForm,
			submitForm,
			toggleComponent
		},
		mounted: function mounted() {
			// Get the current configurations from local storage
			this.resetForm()
			util.getRepos().then(
				(repos) => this.repos = repos,
				(error) => { throw new Error(error) }
			)
		},
		template: `
			<div class="container">
				<div id="top-buttons" class="form-group">
					<button class="btn" v-on:click="tab = 'components'">
						Components
					</button>
					<button class="btn" v-on:click="tab = 'menus'">
						Menu
					</button>
					<button class="btn" v-on:click="tab = 'workspaces'">
						Workspaces
					</button>
					<button class="btn" v-on:click="tab = 'styles'">
						Style
					</button>
					<button class="btn" v-on:click="tab = 'services'">
						Services
					</button>
				</div>

				<div class="form-group" v-if="tab === 'components'">
					<label>Components</label>
					<hr />
					<div v-for="repo in repos" :key="repo.id">
						<span>{{ repo.name }}</span>
						<button
							class="btn btn-remove"
							v-on:change="toggleComponent(component)"
							v-on:click="removeRepo(repo.id)">
							X
						</button>
						<ul class="component-checklist">
							<li v-for="component in repo.components" :key="component.id">
								<input v-model="component.enabled" type="checkbox" />
								{{ component.name }}
							</li>
						</ul>
						<hr/>
					</div>
				</div>

				<form name="configs" action="javascript:void(0)" v-on:submit.prevent="submitForm">
					<div
						class="form-group"
						id="menusGroup"
						v-if="tab === 'menus'">
						<label for="menus">Menu</label>
						<textarea
							class="form-control"
							id="menus"
							name="menus"
							rows="15"
							v-model="form.menus">
						</textarea>
					</div>

					<div
						class="form-group"
						id="workspacesGroup"
						v-if="tab === 'workspaces'">
						<label for="workspaces">Workspaces</label>
						<textarea
							id="workspaces"
							class="form-control"
							rows="15"
							name="workspaces"
							v-model="form.workspaces">
						</textarea>
					</div>

					<div
						class="form-group"
						id="styleGroup"
						v-if="tab === 'styles'">
						<label for="style">Style URL</label>
						<input
							class="form-control"
							id="style"
							name="style"
							v-model="form.cssOverridePath"
							/>
					</div>

					<div
						class="form-group"
						id="servicesGroup"
						v-if="tab === 'services'">
						<label for="services">Services</label>
						<textarea
							class="form-control"
							id="services"
							name="services"
							rows="15"
							v-model="form.services">
						</textarea>
					</div>

					<!-- TODO: Get import button in line with import config field -->
					<div id="importConfigGroup" class="form-group">
						<label for="importConfig">Import Components/Services</label>
						<input
							class="form-control"
							name="importConfig"
							v-model="form.configImportUrl"
							/>
						<button
							class="btn"
							id="import"
							name="import"
							type="button"
							v-on:click="importConfig()">
							Import
						</button>
						<input
							class="btn"
							name="browse"
							type="file"
							v-on:change="loadFile($event)"
							/>
					</div>

					<div id="bottom-buttons" class="form-group">
						<button class="btn" name="apply" type="submit">
							Apply
						</button>
						<button class="btn" name="clear" type="reset" v-on:click="resetForm()">
							Reset
						</button>
						<button
							class="btn"
							id="export"
							type="button"
							v-on:click="exportConfig()">
							Export
						</button>
					</div>
				</form>
			</div>
		`
	})


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

	function getConfigFromForm() {
		const newConfig = {}
		try {
			if (this.form.components.length > 0) {
				newConfig.components = JSON.parse(this.form.components)
			}

			if (this.form.menus.length > 0) {
				newConfig.menus = JSON.parse(this.form.menus)
			}

			if (this.form.workspaces.length > 0) {
				newConfig.workspaces = JSON.parse(this.form.workspaces)
			}

			if (this.form.cssOverridePath.length > 0) {
				newConfig.cssOverridePath = this.form.cssOverridePath
			}

			if (this.form.services.length > 0) {
				newConfig.services = JSON.parse(this.form.services)
			}
		} catch (e) {
			alert("Invalid input.")
			return
		}

		return newConfig
	}

	function importConfig() {
		//const importURL = formData.get("importConfig")
		const importURL = this.form.configImportUrl

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
					const components = JSON.parse(components)
					this.form.components = Object.assign(components, data.components)
				}

				if (data.services && (typeof (data.services)) === "object") {
					let services = JSON.parse(this.form.services)
					services = Object.assign(services, data.services)
					this.form.services = JSON.stringify(services, null, "\t")
				}
			})
			.then(() => {
				this.form.configImportUrl = ''
			})
			.catch((err) => {
				FSBL.Clients.Logger.error(err)
				alert(`Error fetching config from ${importURL}`)
			})
	}

	function loadFile(event) {
		console.log('Importing file')
		const element = event.srcElement
		if (!element.files || !element.files.length) {
			return
		}
		const reader = new FileReader()
		reader.onload = (event) => {
			const configObject = JSON.parse(event.target.result)
			console.log(configObject)
			const [status, data] = util.generateRepo(configObject)
			if (status === 'error') {
				throw new Error(data.msg)
			} else {
				this.repos.push(data)
			}
		}
		reader.readAsText(element.files[0])
	}

	function removeRepo(id) {
		util.setRepos(this.repos.filter(el => el.id !== id)).then(
			(repos) => this.repos = repos,
			(error) => FSBL.Clients.Logger.error(error)
		)
	}

	function resetForm() {
		util.getConfig().then(
			(data) => {
				console.log('RESET CONFIG:', data)
				this.form = {
					components: data.components,
					cssOverridePath: data.cssOverridePath,
					menus: JSON.stringify(data.menus, null, 4),
					services: JSON.stringify(data.services, null, 4),
					workspaces: JSON.stringify(data.workspaces, null, 4)
				}
			},
			(error) => FSBL.Clients.Logger.error(error)
		)
		util.getRepos().then(
			(repos) => {
				console.log('RESET REPOS:', repos)
				this.repos = repos
			},
			(error) => {
				console.log('OOPS:', error)
				FSBL.Clients.Logger.error(error)
			}
		)
	}

	function submitForm() {
		util.applyConfig(this.form).then(
			() => alert('Settings applied'),
			(error) => { throw new Error(error) }
		)
		util.setRepos(this.repos).then(
			() => {},
			(error) => { throw new Error(error) }
		)
	}

	function toggleComponent(component) {
		component.enabled = !component.enabled
		if (component.enabled) {
			this.form.components[component.name] = component
		} else {
			delete this.form.components[component.name]
		}
	}

})()
