# FDC3 Enabled Notification Service

This is a service that augments Finsemble's own notification capabilities and keeps it in line with the proposed FDC3 notification api.

- [FDC3 Issue #378 - Provide Notification API's](https://github.com/finos/FDC3/issues/387)
- [FDC3 Proposal #828 - Actionable Notifications via Intent & Context](https://github.com/finos/FDC3/issues/828)

#### Video of the demonstration the proposed FDC3 intent & context based interface to notifications

<video src="https://user-images.githubusercontent.com/1701764/201643126-f8766d05-d080-42ab-86d1-e2afdd23d317.mp4"/>



## Usage

Notifications are sent, updated and received by raising FDC3 intent with a fdc3.notification context
Please see the [FDC3 Proposal #828 - Actionable Notifications via Intent & Context](https://github.com/finos/FDC3/issues/828) for full details on the notification context object.
As noted in the proposal, to perform actions, fdc3.notifications can contain one or more fdc3.action contexts. Please see the fcd3.action PR here [Symphony PRs in FDC3 2.1 candidates](https://github.com/finos/FDC3/pull/882/files#diff-62a97f7a0f2dd00f704fcdd8038fccc7fd31eed57f084f9d37f3c0db69defe4b)

### Sending a notification

Send a notification by raising an FDC3 intent of type `CreateNotification`

```javascript

// Create a fdc3.notification context object
let notification = {
	"type": "fdc3.notification",
	"title": "The Notification Title",
	"options": {
		"icon": "http://localhost:3375/build/finsemble/assets/img/Finsemble_Toolbar_Icon.png",
		"body": "Body content",
		"notificationType": "notice",
		"actions": [
			{
				"type":"fdc3.action",
				"title": "View Chart",
				"intent": "ViewChart",
				"context": {
					"type": "fdc3.instrument",
					"name": "Apple",
					"id": {
						// Fix ticker
						"ticker": "Appl",
						"RIC": "Appl.OQ",
						"ISIN": "US5949181045"
					}
				}
			}
		]
	}
}

// Raise the CreateNotification intent
let resolution = await fdc3.raiseIntent("CreateNotification", notification);

//Receive an updated notification context - An ID and various status will be set if not provided
let submittedNotification = await resolution.getResult();

```


### Updating A notification

Individual notifications are identified by their IDs. If an ID is not provided, the system will generate and assign a unique one for the specific notification context.
To update a notification, raise a `CreateNotification` with the notification ensuring the ID is specified in the context.

```javascript
// Following on from the Sending a notification example above

// Change a value
submittedNotification.metadata.isSnoozed = true;

await fdc3.raiseIntent("UpdateNotification", submittedNotification);

```


### Receiving notifications

It's possible to get a stream of notifications by raising a `GetNotifications` intent. It's possible to listen to for a subset or all of the notifications.


##### Listening for all notifications

```javascript
//retrieve a past notification and/or a stream of updates about it - pass in an empty filter object as the context
const resolution = await fdc3.raiseIntent("GetNotifications", {type: "fdc3.notification.filter"} );

// Get a channel
const channel = await resolution.getResult();

// Act on incoming notifications
channel.addContextListener("fdc3.notification", (context) => { console.log("No filter", context)})


```


##### Listening for a subset of notifications

```javascript
// Create a filter - The fdc3.notification.filter will match any fields that exist on the fdc3.notification type

const filter = {
	type: "fdc3.notification.filter",
	options: {
		notificationType: "warning",
	}
}


const resolution2 = await fdc3.raiseIntent("GetNotifications", filter);

// Get a channel
const channel2 = await resolution2.getResult();

// Act on incoming notifications - only notifications with notificationType: warning will be returned
channel2.addContextListener(
	"fdc3.notification",
	(context) => {
		console.log("Type Filter", context)
	}
)

```
