# Component sending notification example

This is an example of a component using the Notification Client to send to Notifications.

### Sending a notification

Import the NotificationClient and Notification classes.

```typescript
import NotificationClient from "../finsemble-notifications/services/notification/notificationClient";
import Notification from "../finsemble-notifications/types/Notification-definitions/Notification";
```

Initialise the client

```typescript
const client = new NotificationClient();
```

Create a notification and set the values

```typescript
let notification = new Notification();
notification.title = "Notify world";
```

Send it

```typescript
client.notify(notification);
```

### Actions on notifications

It's possible to perform actions on notifications. Finsemble allows 6 different actions to be performed. Dismiss,
Snooze, Spawn, Transmit, Query, Publish. The first three are handled internally by Finsemble the last three allow you to
perform custom actions on a notification.

Here are the steps required to send actions along with a notification:

Import the Action class and ActionTypes enum.

```typescript
import NotificationClient, { ActionTypes } from "../finsemble-notifications/services/notification/notificationClient";
import Action from "../finsemble-notifications/types/Notification-definitions/Action";
```

Create the actions and attach it to the notification.

```typescript
let action = new Action();
action.type = ActionTypes.SPAWN;
action.component = "Welcome Component";
action.spawnParams = {};
action.buttonText = "Spawn Welcome Component";

notification.actions.push(action);

// Send it
client.notify(notification);
```

You can use the QUERY, TRANSMIT and PUBLISH actions to delegate actions to other components and services. See the
[example service](services/exampleCustomAction) for information on how to do that.
