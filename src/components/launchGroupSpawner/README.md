## Spawning Groups of Components into your Workspace ##
You may wish to spawn a group of components in a predetermined layout. This is recipe demonstrates how to achieve that with the Finsemble LauncherClient API.

![](./spawn_component_group_demo.gif)

### Spawning a group ###
[spawnComponentGroup.js](./spawnComponentGroup.js) provides a utility function that allows you to spawn a group of components, group them and add them to a common linker channel. This is achieved by providing an array of Objects with `componentType` and `spawnOptions` values that define each of the components. The group itself can be spawned at a particular location, from which each component's position is calculated. 

#### Setting a Linker group ####
The components spawned can all be added to the same group on spawn by specifying that group as the final argument to the commend. Alternatively, specify 'auto' to automatically select an unused linker group (or if none is available the least used group).

#### Example usage: ####
```
let toSpawn = [{
		"componentType": "Welcome Component",
		"spawnOptions": {"top": 0, "left": 0, "height": 400, "width": 300, "data": {}}
	},
	{
		"componentType": "Welcome Component",
		"spawnOptions": {"top": 0, "left": 300, "height": 400, "width": 500, "data": {}}
	},
	{
		"componentType": "Welcome Component",
		"spawnOptions": {"top": 400, "left": 0, "height": 400, "width": 800, "data": {})
		}
	}];
let promise = spawnComponentGroup(toSpawn, 200, 200, 'auto'); 
```

The `spawnComponentGroup()` function can be integrated into your project in a variety of ways, for example, call it from a service or other component when you need to spawn your group. 

### Spawning a group from the Launcher menu ###
[launchGroupSpawner.js](./launchGroupSpawner.js) provides an example of using `spawnComponentGroup()` to spawn your group from the Launcher menu. This is achieved by creating a dummy component with `window.options.autoShow: false` set in its config, which then spawns the group. A single, simple component implementation can be used to spawn multiple different types of groups by providing the group config as spawnData, allowing you to define the groups in your normal _/configs/application/components.json_ file. See [config.json](./config.json) for example configured groups.

### Installation ###
To install and run the launchGroupSpawner examples please follow the instuctions below. However, please note that you can import [spawnComponentGroup.js](./spawnComponentGroup.js) into your own code to spawn groups from services or other components.

1. Add the `launchGroupSpawner` component folder to your _/src/components_ directory.
2. Add the component to your webpack build at _/build/webpack/webpack.components.entries.json_: 
```
{
    ...
    "launchGroupSpawner": {
        "output": "components/launchGroupSpawner/launchGroupSpawner",
        "entry": "./src/components/launchGroupSpawner/launchGroupSpawner.js"
    }
    ...
}
```
3. Either add the configuration in [config.json](./config.json) to your _/configs/application/components.json_ file OR import it in your _/configs/application/config.json_ file:
```
	...,
	"importConfig": [
		...,
		"$applicationRoot/components/launchGroupSpawner/config.json"
	]
```
4. Build and run Finsemble and try launching the example component groups from the Launcher menu.
