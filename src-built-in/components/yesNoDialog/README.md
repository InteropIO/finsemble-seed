## YesNo Dialog

### Overview
This is our standard dialog that presents the user with one to three choices. It can be used to allow the user to confirm, reject, or cancel an action. All of these options can be included, and all can be excluded. This component is used with `FSBL.Clients.DialogManager.open`. For more on how we've implemented dialogs, please read the [FinsembleDialog](https://github.com/ChartIQ/finsemble-react-controls/tree/master/FinsembleDialog) control documentation.

### What it looks like
![](./screenshot.png)

### Controls Used
The controls used in this component are documented over in our Finsemble React Controls repo:
* [FinsembleDialog](https://github.com/ChartIQ/finsemble-react-controls/tree/master/FinsembleDialog)
* [FinsembleDialogQuestion](https://github.com/ChartIQ/finsemble-react-controls/tree/master/FinsembleDialogQuestion)
* [FinsembleDialogButton](https://github.com/ChartIQ/finsemble-react-controls/tree/master/FinsembleDialogButton)

### Dialog Parameters
| Param                   | Type    | Default         |
|-------------------------|---------|-----------------|
| question                | String  | `'No Question'` |
| affirmativeResponseText | String  | `'Yes'`         |
| negativeResponseText    | String  | `'No'`          |
| cancelResponseText      | String  | `'Cancel'`      |
| showNegativeButton      | Boolean | true            |
| showAffirmativeButton   | Boolean | true            |
| showCancelButton        | Boolean | true            |
| hideModalOnClose	      | Boolean | true            |
| showTimer						    | Boolean | false           |
| timerDuration           | String  | null            |

**Note, these parameters are passed in as the second parameter to `FSBL.Clients.DialogManager.open`**

### Dialog Response
| Param                   | Possible Values  |
|-------------------------|-----------------|
| err                | `null` \|\| `error` |
| response | Object       |
| response.choice    | `'affirmative', 'negative', 'cancel'`          |

### Usage
```javascript
    let self = this;
    let dialogParams = {
        question: 'This will overwrite the saved data for workspace "' + workspaceName + '". Would you like to proceed?',
        affirmativeResponseText: 'Yes, overwrite',
        negativeResponseText: 'No, cancel',
        includeNegative: true,
        includeCancel: false
    };
    FSBL.Clients.DialogManager.open('yesNo', dialogParams , function (err, response) {
        //choice can be `'affirmative'`, `'negative'`, or `'cancel'`.
        if (err || response.choice === 'affirmative') {
            overwrite();
        }
    });
```

### Related Components
* [SingleInput Dialog](../singleInputDialog/README.md)
* [DialogModal](../dialogModal/README.md)
