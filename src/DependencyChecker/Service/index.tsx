/**
 * :: Runtime App Dependencies recipe ::
 *
 * PLEASE CHECK THE PROVIDED DOCUMENTATION BEFORE USING THIS RECIPE
 */

import { Dependency, DependencyStatus, Status, WindowNameDependencies } from "../../types";

const dependencyStatus: DependencyStatus = {};
const dependencyTimeoutIdMap = new Map<string, NodeJS.Timeout | null>();

/// Maximum number of dependencies that can be registered per app.
const MAX_NUMBER_OF_DEPENDENCIES = 10;

// Interval (in milliseconds) at which the dependency manager checks for updates to dependencies.
const DEPENDENCY_MANAGER_UPDATE_INTERVAL = 5000;

// Interval (in milliseconds) at which the dependency manager checks for unused dependencies.
const DEPENDENCY_CLEANUP_INTERVAL = 20000;

// Timeout (in milliseconds) for cleaning up dependencies.
const DEPENDENCY_CLEANUP_SHUTDOWN = 5000;

// Timeout (in milliseconds) for updating dependencies after a service has closed.
const POST_CLOSE_DEPENDENCY_UPDATE_TIMEOUT = 1000;

//#region UTILS FUNCTIONS

/**
 * Closes a given dependency
 *
 * @param dependencyAppId The dependency appId to close
 * @param windowName The window name to get the wrap
 */
const closeDependency = async (dependencyAppId: string, windowName: string) => {
	const { wrap } = await FSBL.FinsembleWindow.getInstance({
		windowName,
	});

	FSBL.Clients.Logger.log(`DependencyCheckerService - Closing ${windowName} - app id ${dependencyAppId}`);

	return new Promise((resolve) => {
		wrap.close(() => {
			const depTimeout = dependencyTimeoutIdMap.get(dependencyAppId);
			if (depTimeout) {
				clearTimeout(depTimeout);
				dependencyTimeoutIdMap.set(dependencyAppId, null);
			}
			// used to ensure the windowName is free so that it can maybe be reused
			setTimeout(async () => {
				updateStatus(dependencyAppId, "not started");
				resolve("dependency closed");
			}, POST_CLOSE_DEPENDENCY_UPDATE_TIMEOUT);
		});
	});
};

/**
 * Handler for the Dependency Manager
 */
const dependencyManagerHandler = async (err, response) => {
	const { dependency: dependencyAppId, command } = response.data;
	let { windowName } = response.data;

	switch (command) {
		case "start":
			updateStatus(dependencyAppId, "starting");
			const { error, response } = await doSpawn(dependencyAppId);
			updateStatus(dependencyAppId, error ? "error" : "started", response?.windowIdentifier.windowName);
			break;

		case "shutdown":
			if (!windowName) {
				const activeDescriptors = await getActiveDescriptors();
				for (const activeDescriptor in activeDescriptors) {
					if (activeDescriptors[activeDescriptor].componentType === dependencyAppId) {
						windowName = activeDescriptors[activeDescriptor].name;
						break;
					}
				}
			}
			await closeDependency(dependencyAppId, windowName);
			break;

		default:
			break;
	}
};

/**
 * Sends the dependency status updates to the relevant listener
 *
 * @param dependency The dependency appId to update
 */
const updateComponentDependencyStatus = (dependency: string) => {
	const dependentsStatusToUpdate = dependencyStatus[dependency];
	const { dependencyStatus: status } = dependentsStatusToUpdate;
	for (const dependent of dependentsStatusToUpdate.dependents) {
		FSBL.Clients.RouterClient.transmit(`DependenciesStatus_${dependent}`, {
			dependency,
			status,
		});
	}
	FSBL.Clients.RouterClient.publish("DependencyCheckerService.dependenciesStatuses", dependencyStatus);
};

/**
 * Schedules a dependency to be shutdown
 *
 * @param windowName The window name to close
 * @param dependency The dependency to update when shutdown occurs
 */
const scheduleDependencyShutdown = (windowName: string, dependency: Dependency) => {
	const { appId, shutdownTimeout } = dependency;

	if (dependencyTimeoutIdMap.has(appId) && dependencyTimeoutIdMap.get(appId) === null) {
		FSBL.Clients.Logger.log(
			`DependencyCheckerService - Not setting specified timeout for ${appId} requested by ${windowName} since ${appId} exists in the timeout maps but has been set to null ie - some app/service requires this dependency to be permanently online.`
		);
		return;
	}

	const timeoutId = setTimeout(async () => {
		await closeDependency(appId, windowName);
	}, shutdownTimeout);
	FSBL.Clients.Logger.log(
		`DependencyCheckerService - Setting a shutdown timeout of ${shutdownTimeout}ms for dependency ${dependency.appId}`
	);
	dependencyTimeoutIdMap.set(appId, timeoutId);
};

/**
 * If wait for initialization is configured then it is mandatory to query this dedicated channel
 * and wait for a response from the service to signal its readiness.
 *
 * @param windowName The windowName that we want to wait for
 * @returns
 */
const waitForInitialization = async (windowName: string, initializationTimeout = -1) => {
	const promises = [FSBL.Clients.RouterClient.query(`DCS.waitForInitialization_${windowName}`, {})];
	if (initializationTimeout > 0) {
		promises.push(
			new Promise((resolve, reject) => {
				setTimeout(() => {
					return reject({ err: `Timeout reached when waiting for ${windowName} initialization` });
				}, initializationTimeout);
			})
		);
	}

	const { err, response } = await Promise.race(promises);
	if (err) {
		FSBL.Clients.Logger.error(`DependencyCheckerService - waitForInitialization failed for ${windowName}`, err);
		throw new Error(err);
	}
	return response.data;
};

/**
 * Spawns an App
 *
 * @param appId The appId of the app to spawn
 * @param spawnParams The spawn params
 * @returns The spawnResponse or error
 */
const doSpawn = async (appId: string, spawnParams = {}) => {
	FSBL.Clients.Logger.log(`DependencyCheckerService - Spawning dependency ${appId}`);
	return await FSBL.Clients.AppsClient.spawn(appId, spawnParams);
};

/**
 * Method that spawns a given appId and updates its status
 *
 * @param dependency The dependency to spawn
 * @returns a spawn result
 */
const spawnDependency = async (dependency: Dependency) => {
	const { appId } = dependency;
	// only available from 8.4 onwards
	const { err, data = [] } = await FSBL.Clients.AppsClient.getApps([appId]);
	if (err) return { error: err };

	if (data.length === 0) {
		return { error: `Unknown dependency: ${appId}` };
	} else {
		let spawnResult;
		let { retries = 0, interval = 2000 } = dependency;
		let attempt = 0;
		while (attempt < retries) {
			spawnResult = await doSpawn(appId);
			if (!spawnResult.error && spawnResult.response) {
				break;
			}
			await new Promise((resolve) => setTimeout(resolve, interval * 2 ** attempt));
			attempt++;
			FSBL.Clients.Logger.warn(
				`DependencyCheckerService - Failed to spawn dependency ${appId} after ${attempt} of ${retries}`
			);
		}

		if (spawnResult.error) {
			FSBL.Clients.Logger.error(`DependencyCheckerService - Failed to spawn dependency ${appId}`);
		}

		if (dependency.waitForInitialization) {
			const windowName = spawnResult.response?.windowIdentifier.windowName;
			if (!windowName) throw Error("Missing window name"); // this should never occur

			FSBL.Clients.Logger.log(`DependencyCheckerService - waiting for ${windowName} to signal its readiness`);
			try {
				await waitForInitialization(windowName, dependency.initializationTimeout);
			} catch (error) {
				spawnResult.error = error;
			}
		}
		return spawnResult;
	}
};

/**
 * Gets the currently active spawned window descriptors.
 *
 * @returns the currently active descriptor
 */
const getActiveDescriptors = async () => {
	const { err: activeDescriptorsError, data: activeDescriptors = {} } =
		await FSBL.Clients.LauncherClient.getActiveDescriptors();

	if (activeDescriptorsError) {
		FSBL.Clients.Logger.error("DependencyCheckerService - Unable to get active descriptors", activeDescriptorsError);
		throw activeDescriptorsError;
	}

	return activeDescriptors;
};

/**
 * Gets the currently active distinct component types
 *
 * @returns a Set of the spawned component types
 */
const getDistinctActiveComponentTypes = async () => {
	const activeDescriptors = await getActiveDescriptors();
	// removes duplicates
	return new Set(Object.values(activeDescriptors).map((activeDescriptor) => activeDescriptor.componentType));
};

/**
 * This method closed the currently open DependencyChecker client window
 * and spawns the relevant native app.
 *
 * @param windowName The windowName to close and to pass to the native app spawn.
 * @param appIdToSpawn The appId of the native app to spawn
 * @param appPath The path for the native app exe
 * @param args The arguments passed to the native app if any
 * @param argumentsAsQueryString true args is a query string, false otherwise
 */
const spawnNativeApp = async (
	windowName: string,
	appIdToSpawn: string,
	appPath: string,
	args: string,
	argumentsAsQueryString: boolean
) => {
	const { wrap } = await FSBL.FinsembleWindow.getInstance({
		windowName,
	});
	// await get bounds - ensure position absolute
	const { err, data: bounds } = await wrap.getBounds();
	if (err) {
		FSBL.Clients.Logger.error(`DependencyCheckerService - Unable to get bounds for native app`, err);
	}

	const spawnParams = {
		path: appPath,
		name: windowName,
		windowType: "native",
		top: bounds?.top ?? 0,
		left: bounds?.left ?? 0,
		right: bounds?.right,
		height: bounds?.height,
		bottom: bounds?.bottom,
		width: bounds?.width,
		position: "absolute",
		arguments: args,
		argumentsAsQueryString,
	};

	wrap.close({}, () => {
		// close callback can be invoked whilst there are still some cleaning up being done
		// and the windowName is not completely free to be re-used - hence this setTimeout
		setTimeout(async () => {
			await doSpawn(appIdToSpawn, spawnParams);
		}, 2000);
	});
};

/**
 * Util method that builds the initial data structures to aid the
 * dependency spawn.
 *
 * @param windowName The window name requesting dependency spawns
 * @param dependencies The dependencies to spawn
 * @returns An object of dependencies appIds and DependencyStatus
 */
const setInitialDependencyStatus = (windowName: string, dependencies: Dependency[]) => {
	// set dependencies state as not started by default
	// if they are running already this will be updated in the
	// while loop below
	const dependencyAppIds = dependencies.map((dep: Dependency) => dep.appId);
	for (const depAppId of dependencyAppIds) {
		if (dependencyStatus[depAppId] && !dependencyStatus[depAppId].dependents.includes(windowName)) {
			dependencyStatus[depAppId].dependents.push(windowName);
		} else {
			dependencyStatus[depAppId] = {
				dependents: [windowName],
				dependencyStatus: "not started",
			};
		}
	}

	return {
		dependencyAppIds,
	};
};

/**
 * Util function to update a dependency status
 *
 * @param dependencyAppId The dependency appId to update
 * @param status The new status for the dependency
 * @param windowName an optional window name
 */
const updateStatus = (dependencyAppId: string, status: Status, windowName?: string) => {
	FSBL.Clients.Logger.log(`DependencyCheckerService - Dependency ${dependencyAppId} status: ${status}`);
	dependencyStatus[dependencyAppId].dependencyStatus = status;
	if (windowName) {
		dependencyStatus[dependencyAppId].windowName = windowName;
	}
	updateComponentDependencyStatus(dependencyAppId);
};

/**
 * Util method that will check whether there is a timeout id to clear.
 *
 * @param dependency - The dependency to check for shutdown timeout
 * @param windowName - The windowName requesting the dependency
 */
const maybeClearTimeoutId = (dependency: Dependency, windowName: string) => {
	const { appId } = dependency;

	const depTimeoutId = dependencyTimeoutIdMap.get(appId);
	if (!dependency.shutdownTimeout && depTimeoutId) {
		FSBL.Clients.Logger.log(
			`DependencyCheckerService - Window ${windowName} has dependency ${appId} and no timeout was specified. This dependency has a scheduled timeout which will be cleared since it is assumed that tha ${windowName} requires ${appId} to be always online`
		);
		clearTimeout(depTimeoutId);
		dependencyTimeoutIdMap.set(appId, null);
	}
};

//#endregion UTILS FUNCTIONS

/**
 * Main routine for this service
 */
const main = async () => {
	// pubsub responder to publish dependencies statuses updates
	FSBL.Clients.RouterClient.addPubSubResponder("DependencyCheckerService.dependenciesStatuses", {});

	// listener to execute dependency manager commands (eg. shutdown, startup dependencies)
	FSBL.Clients.RouterClient.addListener("DependencyChecker.dependencyManagerCommands", dependencyManagerHandler);

	const windowNameDependencies: WindowNameDependencies = {};

	FSBL.Clients.RouterClient.addListener("DependencyCheckerService", async (err, response) => {
		if (err) {
			FSBL.Clients.Logger.error("DependencyCheckerService - addListener error", err);
			return;
		}

		const { dependencies, windowName, appId, appConfig, appPath } = response.data;
		const { arguments: args, argumentsAsQueryString = false } = appConfig.hostManifests.Finsemble.window;

		windowNameDependencies[windowName] = dependencies;

		const { dependencyAppIds } = setInitialDependencyStatus(windowName, dependencies);

		try {
			if (dependencyAppIds.length) {
				// get the active descriptors
				const distinctSpawnedComponentTypes = await getDistinctActiveComponentTypes();

				let iterations = 0; // variable to prevent infinite loops
				while (dependencyAppIds.length > 0) {
					for (const depAppId of dependencyAppIds) {
						// get dependency to spawn
						const dependencyToSpawn: Dependency | undefined = windowNameDependencies[windowName].find(
							(dependency) => depAppId === dependency.appId
						);
						if (!dependencyToSpawn) {
							throw Error(`Could not find dependency to spawn ${depAppId}`);
						}
						const { appId: dependencyToSpawnAppId } = dependencyToSpawn;

						// if we already have a spawned dependency:
						//  * update its status
						//  * remove it from the dependencyAppIds array
						if (distinctSpawnedComponentTypes.has(dependencyToSpawnAppId)) {
							updateStatus(depAppId, "started");

							dependencyAppIds.splice(dependencyAppIds.indexOf(dependencyToSpawnAppId), 1);
							// dependency has started check to see if needs to clear a timeout
							maybeClearTimeoutId(dependencyToSpawn, windowName);
						} else {
							// otherwise:
							//  * update its status to: starting
							//  * spawn the dependency (wait for spawn response)
							//  * set shutdown if specified
							//  * update its status accordingly (started/error)
							//  * remove it from the dependencyAppIds array

							//  update its status to: starting
							const alreadyStarting = dependencyStatus[depAppId].dependencyStatus === "starting";

							if (alreadyStarting) {
								FSBL.Clients.Logger.log(
									`DependencyCheckerService - Dependency ${depAppId} already starting - skipping spawn`
								);
								dependencyAppIds.splice(dependencyAppIds.indexOf(depAppId), 1);
							} else {
								updateStatus(depAppId, "starting");

								//  spawn the dependency
								const spawnResult = await spawnDependency(dependencyToSpawn);

								// update its status to started
								if (spawnResult.error) {
									updateStatus(depAppId, "error");
									throw spawnResult.error;
								}

								const { response } = spawnResult;

								// set shutdown if specified
								if (dependencyToSpawn.hasOwnProperty("shutdownTimeout")) {
									scheduleDependencyShutdown(response?.windowIdentifier.windowName ?? "", dependencyToSpawn);
								} else {
									dependencyTimeoutIdMap.set(depAppId, null);
								}

								// update its status to started
								updateStatus(depAppId, "started", response?.windowIdentifier.windowName);

								// remove it from the dependencyAppIds array
								const componentType = response?.windowIdentifier.componentType ?? "";
								dependencyAppIds.splice(dependencyAppIds.indexOf(componentType), 1);
							}
						}
					}
					iterations++;
					if (dependencyAppIds.length === 0 || iterations == MAX_NUMBER_OF_DEPENDENCIES) break;
				}

				if (appPath) {
					await spawnNativeApp(windowName, appId, appPath, args, argumentsAsQueryString);
				}
			}
		} catch (error) {
			FSBL.Clients.Logger.error("DependencyCheckerService - Error spawning component dependencies", error);
		}
	});

	// dependency manager updater
	setInterval(async () => {
		const distinctActiveComponentTypes = await getDistinctActiveComponentTypes();

		for (let [key, value] of Object.entries(dependencyStatus)) {
			if (value.dependencyStatus === "error" || value.dependencyStatus === "starting") {
				continue; // if a dependency is in error state or starting do not update it's status
			}
			if (value.dependencyStatus === "started" && !distinctActiveComponentTypes.has(key)) {
				FSBL.Clients.Logger.warn(
					`DependencyCheckerService - ${key} marked has started but not found in active descriptors. Possible crash or closed by the user or other applications. Marking it as not started`
				);
				updateStatus(key, "not started");
			} else if (value.dependencyStatus !== "started" && distinctActiveComponentTypes.has(key)) {
				FSBL.Clients.Logger.warn(
					`DependencyCheckerService - ${key} marked has ${value.dependencyStatus} but found in active descriptors. Marking it as started`
				);
				updateStatus(key, "started");
			}
		}
	}, DEPENDENCY_MANAGER_UPDATE_INTERVAL);

	// dependency cleanup
	setInterval(async () => {
		const activeDescriptors = await getActiveDescriptors();
		const activeWindowNames = Object.keys(activeDescriptors);

		const windowNameDeps = Object.keys(windowNameDependencies);

		for (const wName of windowNameDeps) {
			if (!activeWindowNames.includes(wName)) {
				delete windowNameDependencies[wName];

				for (let [key, value] of Object.entries(dependencyStatus)) {
					value.dependents.splice(value.dependents.indexOf(wName), 1);
					updateStatus(key, value.dependencyStatus);

					if (value.dependents.length === 0) {
						// mark dependency to be shutdown
						FSBL.Clients.Logger.warn(
							`DependencyCheckerService - ${key} has no active dependents. Scheduling ${key} to be shutdown`
						);
						const timeoutId = setTimeout(async () => {
							await closeDependency(key, value.windowName!);
						}, DEPENDENCY_CLEANUP_SHUTDOWN);
						dependencyTimeoutIdMap.set(key, timeoutId);
					}
				}
			}
		}
	}, DEPENDENCY_CLEANUP_INTERVAL);

	FSBL.publishReady();
};

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", main);
} else {
	window.addEventListener("FSBLReady", main);
}
