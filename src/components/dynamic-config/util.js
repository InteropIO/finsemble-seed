// Utility functions that don't belong in the component
(() => {
	const util = {
		applyConfig,
		generateRepo,
		getConfig,
		getRepos,
		setRepos
	}
	window.util = util

	// Wrapper for the Finsemble config client
	function applyConfig(config) {
		return new Promise((resolve, reject) => {
			FSBL.Clients.ConfigClient.processAndSet(
				{
					newConfig: config,
					overwrite: true,
					replace: false
				},
				(err, finsemble) => {
					if (err) {
						reject(err)
						return
					}

					const components = filterComponents(finsemble.components)

					// Configuration successfully applied, save for user config.
					FSBL.Clients.StorageClient.save(
						{
							topic: "user",
							key: "config",
							value: {
								components,
								menus: finsemble.menus,
								workspaces: finsemble.workspaces,
								cssOverridePath: finsemble.cssOverridePath,
								services: config.services
							}
						},
						(error) => error ? reject(error) : resolve()
					)
				}
			)
		})
	}

	// Filter out system components. If a customer wants to override a presentation element with their own, they need to
	// make sure not to set component.category === "system"
	function filterComponents(inputComponents) {
		const components = {}
		Object.keys(inputComponents).forEach((componentName) => {
			const component = inputComponents[componentName]
			if (component && (!component.component || (component.component.category !== "system"))) {
				components[componentName] = component
			}
		})

		return components
	}

	// This maps configuration json data to a repo-friendly format.
	// Returns a tuple with `['error', Object]` or `['ok', Object]`
	// depending if generating the repository was successful or not
	function generateRepo(configObject, name) {
		if (!configObject) {
			return ['error', { msg: 'No config object provided' }]
		}
		if (!configObject.components) {
			return ['error', { msg: 'No components found in config' }]
		}
		const repo = {}
		repo.id = uuidv4()
		repo.name = name || configObject.name || repo.id
		repo.description = configObject.description || configObject.comments || ''
		repo.components = Object.keys(configObject.components).map((key) => {
			return Object.assign(
				{
					id: uuidv4(),
					enabled: false,
					name: key
				},
				configObject.components[key])
		})
		return ['ok', repo]
	}

	function getConfig() {
		return new Promise((resolve, reject) => {
			FSBL.Clients.ConfigClient.getValue(
				{
					field: "finsemble"
				},
				(error, data) => {
					if (error) {
						reject(error)
						return
					}
					if (!data) {
						reject(new Error('No data received from FSBL.Clients.ConfigClient.getValue()'))
						return
					}

					getServices().then(
						(services) => {
							resolve(Object.assign(data, {
								components: filterComponents(data.components),
								cssOverridePath: data.cssOverridePath || '',
								menus: data.menus || {},
								services,
								workspaces: data.workspaces || {}
							}))
						},
						(error) => reject(error)
					)
				}
			)
		})
	}

	function getRepos() {
		return new Promise((resolve, reject) => {
			FSBL.Clients.StorageClient.get(
				{
					topic: "finsemble",
					key: "repos"
				},
				(error, repos) => {
					if (error) {
						reject(error)
						return
					}
					resolve(repos || [])
				}
			)
		})
	}

	function getServices() {
		return new Promise((resolve, reject) => {
			FSBL.Clients.StorageClient.get(
				{
					topic: "user",
					key: "config"
				},
				(error, data) => {
					if (error) {
						reject(error)
						return
					}

					if (data && data.services) {
						resolve(data.services)
					} else {
						resolve({})
					}
				}
			)
		})
	}

	// Write the imported repos to the storage client
	function setRepos(repos) {
		return new Promise((resolve, reject) => {
			FSBL.Clients.StorageClient.save(
				{
					topic: "finsemble",
					key: "repos",
					value: repos
				},
				(error) => error ? reject(error) : resolve(repos)
			)
		})
	}

	// RFC4122 version 4 compliant unique ID generator
	// https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript#2117523
	function uuidv4() {
		return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
			(c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
		)
	}

})()
