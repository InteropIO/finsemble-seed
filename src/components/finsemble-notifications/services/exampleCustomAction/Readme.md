# Perform actions and send notifications in a Finsemble service

This is an example service used to listen to custom action requests being sent in Finsemble.

### Performing custom actions

An action can have one of three types that tell Finsemble to delegate the action to a different part of the system.
The types are `ActionTypes.TRANSMIT`, `ActionTypes.QUERY` and `ActionTypes.PUBLISH`.

Specify the `action.type` of set the `action.channel` and `action.payload`. _(See [sending notifications](./components/notify) for details on the notification client setup and sending.)_

```typescript
action.type = ActionTypes.TRANSMIT;
action.payload = { data: "hello action" };
action.channel = "channel-on-the-router";
action.buttonText = "Perform Action";
```

Notice that the 3 specific action types correspond to the 3 communication patterns provided by the router.

In your service you are now able to listen to the channel specified on the action.

```typescript
Finsemble.Clients.RouterClient.addListener(
	"channel-on-the-router", // Matches action.channel
	(error, response) => {
		if (!error) {
			let notification = reponse.data.notification;
			let payload = reponse.data.actionPayload;
			// Do something
		}
	}
);
```

Follow the Finsemble Router documentation for more info on using the Router Transports
