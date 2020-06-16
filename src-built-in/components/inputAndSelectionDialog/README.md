## SingleInput Dialog

### Overview

This is the dialog we show when we need a name for a new workspace. In addition to simplly creatingIt allows the user to select a template as the basis of their new workspace.

### What it looks like

![](./screenshot.png)

### Dialog Parameters

| Param               | Type   | Default         |
| ------------------- | ------ | --------------- |
| inputLabel          | String | `'No Question'` |
| templateDefinitions | Object | NA              |
| showCancelButton    | String | `'Okay'`        |

**Note, these parameters are passed in as the second parameter to `FSBL.Clients.DialogManager.open`**

### Dialog response

| Param             | Possible Values                                                             |
| ----------------- | --------------------------------------------------------------------------- |
| err               | `null` \|\| `error`                                                         |
| response          | Object                                                                      |
| response.choice   | `'affirmative', 'negative', 'cancel'`                                       |
| response.template | String. This is the template that the new workspace will be generated from. |
| response.value    | This is the name of the new workspace.                                      |

### Usage

```javascript
//cb is a callback that accepts the response of this dialog and creates a new workspace.
Logger.system.log("SpawnWorkspaceInput - start");
function onUserInput(err, response) {
	Logger.system.log("SpawnWorkspaceInput onUserInput", response);
	if (err) {
		//Error objects cause async to invoke the final callback in async.waterfall.
		err = new Error(err);
	}
	if (cb) {
		cb(err, response);
	}
}

FSBL.Clients.WorkspaceClient.getTemplates(function(templateDefinitions) {
	Logger.system.log("getTemplates", templateDefinitions);
	let dialogParams = {
		inputLabel: "",
		templateDefinitions: templateDefinitions,
		affirmativeButtonLabel: "Continue",
		showCancelButton: false,
		showNegativeButton: false,
	};

	Actions.spawnDialog("inputAndSelection", dialogParams, onUserInput);
});
```

### Related Components

- [YesNo Dialog](../yesNoDialog/README.md)
- [DialogModal](../dialogModal/README.md)
