export const getAppDUrl = async () => {
	const field = "finsemble.custom.appDUrl";
	const {data} = await FSBL.Clients.ConfigClient.getValue({field});
	return data ? data : null;
}


export const getAppDListing = async (appDUrl:string, allowedOnly = true):Promise<[]> => {
	return new Promise(async (resolve) => {
		function reqListener() {
			// @ts-ignore
			const jsonResponse = JSON.parse(this.responseText);

			let applications = jsonResponse.applications || [];
			if (allowedOnly) {
				if (applications && applications.length > 0) {
					applications = applications.filter((app: any) => {
						return app.entitled
					})
				}
			}
			resolve(applications);
		}

		const oReq = new XMLHttpRequest();
		oReq.addEventListener("load", reqListener);
		oReq.open("GET", `${appDUrl}apps/`);
		oReq.send();
	});
}

const getManifestFromAppDEntry = async (appDEntry: any) => {
	try {
		return JSON.parse(appDEntry.manifest);
	} catch (e) {
		console.error(`Could not parse manifest ${appDEntry.appId}`, e);
	}
}

export const convertAppDToManifest = async (appDListing: any[]) => {
	const manifest: { [key: string]: any } = {};
	for (const app of appDListing) {
		manifest[app.appId] = await getManifestFromAppDEntry(app);
	}
	return manifest;
}

export const getFolderList = (appDListing:any[]) => {
	const folders:string[] = [];
	for (const app of appDListing) {
		app.tags?.forEach((tagName:string) => {
			if(!folders.includes(tagName)) {
				folders.push(tagName)
			}
		})
	}
	return folders;
}

export const addAppsToFinsemble = async (components:any) => {
	return new Promise((resolve) => {
		const config = {components};

		FSBL.Clients.ConfigClient.processAndSet(
			{
				newConfig: config,
				overwrite: true,
				replace: true
			},
			(err) => {
				if (err) {
					console.error(err);
					return;
				}
				resolve()
			});
	});
};

const folderTemplate = {
	icon: "ff-component",
	type: "folder",
	canDelete: false,
	// Custom field to allow for removal later (not done)
	customAddedDynamically:true,
	apps: [
		// {
		// 	"name": "Welcome Component",
		// 	"appID": "welcome-comp"
		// },
	]
}

/**
 * Only sets initial stores
 * @param components
 * @param appDListing
 */
export const addAppsToFolders = async (newConfig:any) => {
	return new Promise(async (resolve) => {
		FSBL.Clients.ConfigClient.processAndSet(
			{
				newConfig: newConfig,
				overwrite: true,
				replace: true,
			},
			() => {
				resolve();
			});
	})

}

export const getNewConfig = async (components:any, appDListing:any[]) => {
	return new Promise(async (resolve) => {
		const folderList = getFolderList(appDListing);

		FSBL.Clients.ConfigClient.getValue(
			{field:"finsemble.servicesConfig.distributedStore.initialStores"},
			async (err:any, config:any) => {
				if(!err) {
					config.forEach((initialStore:any, key:string) => {
						if(initialStore["name"] === "Finsemble-AppLauncher-Store") {

							const {folders, list} = config[key]["foundation"]["appFolders"];

							for(const folderName of folderList) {
								if(!list.includes(folderName)) {
									list.push(folderName);
								}

								if(!folders[folderName]) {
									folders[folderName] = Object.assign({}, folderTemplate)
									folders[folderName].apps = [];
								}
							}

							for(const appListing of appDListing) {
								if(appListing.tags) {
									for(const tag of appListing.tags) {
										let folder = folders[tag];
										if(folder.apps.every((app:any) => app.appId !== appListing.appId)) {
											folder.apps.push({
												appID: appListing.appId,
												name: appListing.appId,
												displayName: appListing.name
											})
										}
									}
								}
							}

							let newConfig = {
								servicesConfig: {
									distributedStore: {
										initialStores: config
									}
								}
							}
							resolve(newConfig)
						}
					})
				}
			}
		);
	});
}

export const updateStore = async (userName:string, newConfig:any) => {
	return new Promise((resolve) => {
		FSBL.Clients.StorageClient.setUser({ user: userName}, () => {
			FSBL.Clients.StorageClient.get(
				{ topic:"finsemble", key:"distributedStore-Finsemble-AppLauncher-Store" },
				(error, store) => {
					if(store?.values?.appFolders) {
						newConfig.servicesConfig.distributedStore.initialStores.forEach((initialStore:any, key:string) => {


							if (initialStore["name"] === "Finsemble-AppLauncher-Store") {
								// TODO: This merging of objects means it only adds folders and will not clear out empty AppD ones added previously
								// The "customAddedDynamically" let's you know it was not added by a users and by this script
								store.values.appFolders = Object.assign(store.values.appFolders, initialStore["foundation"]["appFolders"])
							}
						})

						FSBL.Clients.StorageClient.save({
							topic:"finsemble",
							key:"distributedStore-Finsemble-AppLauncher-Store",
							value:store
						}, () => {
							resolve()
						})
					} else {
						resolve()
					}
			});
		})
	})
}
