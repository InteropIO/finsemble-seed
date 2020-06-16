## SingleInput Dialog

### Overview

This is the dialog we show when we need a name for a new workspace. This component is used with `FSBL.Clients.DialogManager.open`. For more on how we've implemented dialogs, please read the [FinsembleDialog](https://github.com/ChartIQ/finsemble-react-controls/tree/master/FinsembleDialog) control documentation.

### What it looks like

![](./screenshot.png)

### Controls Used

The controls used in this component are documented over in our Finsemble React Controls repo:

- [FinsembleDialog](https://github.com/ChartIQ/finsemble-react-controls/tree/master/FinsembleDialog)
- [FinsembleDialogQuestion](https://github.com/ChartIQ/finsemble-react-controls/tree/master/FinsembleDialogQuestion)
- [FinsembleDialogButton](https://github.com/ChartIQ/finsemble-react-controls/tree/master/FinsembleDialogButton)

### Dialog Parameters

| Param                   | Type   | Default         |
| ----------------------- | ------ | --------------- |
| question                | String | `'No Question'` |
| affirmativeResponseText | String | `'Okay'`        |

**Note, these parameters are passed in as the second parameter to `FSBL.Clients.DialogManager.open`**

### Dialog response

| Param          | Possible Values                       |
| -------------- | ------------------------------------- |
| err            | `null` \|\| `error`                   |
| response       | Object                                |
| response.value | `'affirmative', 'negative', 'cancel'` |

### Usage

```javascript
let dialogParams = {
	inputLabel: "Enter a name for your new workspace.",
	affirmativeButtonLabel: "Continue",
};

FSBL.Clients.DialogManager.open("singleInput", dialogParams, function(
	err,
	response
) {
	if (err) {
		throw new Error(err);
	}
	createWorkspace(response.value);
});
```

### Related Components

- [YesNo Dialog](../yesNoDialog/README.md)
- [DialogModal](../dialogModal/README.md)
