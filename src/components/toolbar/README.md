# Sample Toolbar Component for Finsemble

This is a sample toolbar built for the Finsemble framework using our React Controls. This is a starting point for developing a custom system toolbar for Finsemble. Our toolbar is made up of several sections, each of which can contain components. The toolbar contents are driven by a config and can be modified dynamically.

## Controls And Other Components

The toolbar uses the config to [compose](https://reactjs.org/docs/composition-vs-inheritance.html) a toolbar. It uses the following controls, detailed in our React Controls repo.

- [Finsemble Toolbar](https://github.com/ChartIQ/finsemble-react-controls/tree/master/FinsembleToolbar)
- [Finsemble Toolbar Section](https://github.com/ChartIQ/finsemble-react-controls/tree/master/FinsembleToolbarSection)
- [Finsemble Button](https://github.com/ChartIQ/finsemble-react-controls/tree/master/FinsembleButton)
- [Finsemble Toolbar Seperator](https://github.com/ChartIQ/finsemble-react-controls/tree/master/FinsembleToolbarSeprator)

The toolbar supports a "right," "left," and "center" section and those are created based on the `align` property of the items on the toolbar. It then creates buttons for each config (see below for a sample config) item in the `menuItems` based on the `type` property. The currently created types are:

- menu - This will create a Finsemble Button of type `MenuLauncher`, which is specifically designed to launch menus. When the toolbar loads, it pre-spawns all menu components in a hidden state to improve performance.
- workspace - This will create a Workspace Launcher Button which is designed to launch workspaces.
- component - This will create a Finsemble Button of type `AppLauncher`, which is designed to spawn a Finsemble component.
- seperator - This will create a seperator.
- reactComponent - This is used to insert custom react components into the toolbar.

It also uses a customized Finsemble Button as the `overflowMenuControl` for the "center" section of the Finsemble Toolbar Section.

Another customized Finsemble Button, the Workspace Launcher Button, provides a way to switch to a specific workspace. The click event for the button dispatches a message to the [Workspace Management Menu](https://github.com/ChartIQ/finsemble-seed/tree/master/src/samples/workspaceManagementMenu) for switching workspaces.

## Config and Dynamic Updates

### The Toolbar Store
The toolbar component creates a global store using the Finsemble [Distributed Store Client](https://documentation.chartiq.com/finsemble/DistributedStoreClient.html) called 'Finsemble-Toolbar-Store'. The toolbar initially loads the items from the config into the `menus` field of the store. Updating the `menus` field will update the items on the toolbar.

### Toolbar Pins
The FinsembleToolbar also provides the functionality to "pin" items to the toolbar in the "center" section. For this functionality, the components that need to pin items to the toolbar need to add a pin to the `pins` field of the Toolbar Store. The pins are configured in the same way as the items in the `menuItems`. For sample code, see the [AppLauncher component](../appLauncher/) and the [Workspace Management component](../workspaceManagementMenu/) which make use of this functionality.

The toolbar saves pins to storage using the Finsemble [Storage Client](https://documentation.chartiq.com/finsemble/StorageClient.html) and loads them back from storage on startup.

## Adding Custom React Components
The Finsemble Toolbar component demonstrates how to add custom React components into the toolbar using the "AutoArrange" and "BringToFront" components. To add your custom components, add them to the `customComponents` array in toolbar.jsx:

```jsx
import MyCustomReactComponent from 'MyCustomReactComponent';
customComponents['MyCustomReactComponent'] = MyCustomReactComponent;
```

## Config

Here is a sample config to use with our sample toolbar. This config is read from the `finsemble.menus` section of the config. For more details on the Finsemble config, see our [config tutorial](https://documentation.chartiq.com/finsemble/tutorial-understandingConfiguration.html) on our website.

```json
"window": {
	"id": "launcher",
	"url": "$applicationRoot/components/system/toolbar/toolbar.html",
	"height": 40,
	"top": 0,
	"left": 0,
	"right": 0,
	"position": "available",
	"claimMonitorSpace": true, //This tells finsemble not to remove the space occupied by the toolbar from the available space on the monitor.
	"addToWorkspace": false, //Toolbars are not part of the workspace.
	"options": {
		"contextMenu": false,
		"resizable": false,
		"showTaskbarIcon": false,
		"resizeRegion": {
			"bottomRightCorner": 0,
			"size": 0
		}
	}
},
```
Here is a sample of the component part of the config with some components. The `type` determines what component is used to render that item on the toolbar. We have sample components for launching menus, components, switching workspaces and a `reactComponent` type for use with any custom React component.

```javascript
 "component": {
	"category": "system",
	"spawnOnStartup": true,
	"spawnOnAllMonitors": true, //Mirrors the toolbar on each monitor
	"menuItems": [
		{
			"align": "left",
			"icon": "URL_OF_ICON",
			"component": "File Menu",
			"type": "menu"
		},
		{
			"align": "left",
			"label": "Workspaces",
			"component": "Workspace Management Menu",
			"type": "menu"
		},
		{
			"align": "left",
			"label": "Premium",
			"component": "App Launcher",
			"type": "menu",
			"customData": {
				"mode": "premium"
			}
		},
		{
			"align": "right",
			"type": "reactComponent",
			"reactComponent": "AutoArrange"
		},
		{
			"align": "right",
			"type": "reactComponent",
			"reactComponent": "MyCustomReactComponent"
		}
	]
},
```
