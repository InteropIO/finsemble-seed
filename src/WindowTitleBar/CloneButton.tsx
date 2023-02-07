import React from "react";
import {FinsembleWindow, SpawnParams, WindowBounds} from "@finsemble/finsemble-core";

type CloneButtonProps = {

}

export const CloneButton: React.FunctionComponent<CloneButtonProps> = () => {

	/**
	 * Clones an app
	 * @param bounds
	 * @param addToTabGroup
	 * @param staggerPosition
	 */
	const cloneApp = async (bounds?:WindowBounds, addToTabGroup?:boolean, staggerPosition:number = 25) => {
		let {component, spawnParams,componentState} = await getComponentData(finsembleWindow);
		if(bounds) {
			delete spawnParams.top;
			delete spawnParams.left;
			delete spawnParams.width;
			delete spawnParams.height;
			spawnParams = {...spawnParams, ...bounds}
		}

		if(!bounds && staggerPosition) {
			// Can this always be assumed to be a number?
			spawnParams.top = spawnParams.top ? spawnParams.top as number + staggerPosition : staggerPosition;
			spawnParams.left = spawnParams.left ? spawnParams.left as number + staggerPosition : staggerPosition;
		}

		const {response} = await FSBL.Clients.AppsClient.spawn(component, {...spawnParams, addToWorkspace: true});
		// Race condition
		prepareComponentState(spawnParams.name as string,componentState)

		if(response?.finWindow) {
			// setComponentState(response.finWindow, componentState);
			if(addToTabGroup) {
				addWindowToTabGroup(response.finWindow.name)
			}
		}
	}

	/**
	 * Finds local window's tab collection and add's clone to it if it exists. Creates a new tab collection otherwise.
	 * @param name
	 */
	const addWindowToTabGroup = async (name) => {
		const { err, data } = await FSBL.Clients.WindowClient.getTabCollectionForWindow({windowName: finsembleWindow.name});
		if(err) {
			await FSBL.Clients.WindowClient.createTabCollection({windowNames: [finsembleWindow.name, name], promotedTab:name});
			return;
		}

		if(data) {
			await FSBL.Clients.WindowClient.addToTabCollection({
				tabCollectionId: data.id,
				windowNames: [name],
				promotedTab: name
			});
		}
	}

	/**
	 * Too slow. Linker does not change.
	 */
	const setComponentState = (fsblWindow: FinsembleWindow, componentState: Object) => {
		const fields:any[] = [];
		Object.keys(componentState).forEach((key) => {
			fields.push({field:key, value:componentState[key]})
		})

		fsblWindow.setComponentState({fields})
	}

	/**
	 * Originally used to set component state before spawn but set it immediately after spawn - potential race condition.
	 * @param windowName
	 * @param componentState
	 */
	const prepareComponentState = async (windowName:string, componentState:any) => {
		const topic = "finsemble.workspace.cache"
		await FSBL.Clients.StorageClient.save({
			topic,
			key: `activeWorkspace${windowName}${windowName}`,
			value: componentState
		})
	}

	/**
	 * Unused. But can be used to clone a window other than the current window
	 * (potentially not correct url if remote clone)
	 * Add to tab group would need to be updated for remote clone.
	 * @param windowName
	 */
	const getWindow = async (windowName) => {
		const {wrap} = await FSBL.FinsembleWindow.getInstance({
			windowName
		})

		return wrap;
	}


	/**
	 *
	 * @param fsblWindow
	 */
	const getComponentData = async (fsblWindow:FinsembleWindow): Promise<{component: string, spawnParams: SpawnParams, componentState:any}> => {
		const {windowOptions} = fsblWindow;

		// Component Type
		const component = windowOptions.componentType;

		// Get the URL
		// Potential bug here? Is this the current url?
		const url = windowOptions.url;

		// Window dimensions and position
		const {data:currBounds} = await finsembleWindow.getBounds();

		const bounds:any = {};
		if (currBounds) {
			bounds.left = currBounds.left
			bounds.top = currBounds.top
			bounds.width = currBounds.width
			bounds.height = currBounds.height
		}

		// component state
		const componentState =  await getAsyncComponentState(fsblWindow);

		return {
			component,
			componentState,
			spawnParams:{
				url,
				...bounds,
				name:generateWindowName(component)
			}};
	}

	/**
	 * Generates a window name for the clone. Used to set components state as quickly as possible
	 * @param componentType
	 */
	const generateWindowName = (componentType):string => {
		//Note: This will only work in localhost or a secure environment.
		return `${componentType}-clone-${crypto.randomUUID()}`;
	}

	/**
	 * simplified getComponentState and returning a promise
	 * @param win
	 */
	const getAsyncComponentState = (fsblWindow:FinsembleWindow) => {
		return new Promise((resolve, reject) => {
			fsblWindow.getComponentState({}, (err, response) => {
				if(err) {
					reject(err);
				} else {
					resolve(response);
				}
			})
		})
	}



	return (<div onClick={() => {cloneApp(undefined, true)}} className="fsbl-icon fsbl-copy" title="Clone" id="fsbl-window-clone">
		<i className="ff-copy"></i>
	</div>)
}
