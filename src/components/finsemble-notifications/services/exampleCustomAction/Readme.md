# Perform actions and send notifications in a Finsemble service

This is an example service used to listen to custom action requests being sent in Finsemble.

Required reading: https://documentation.chartiq.com/finsemble/tutorial-TheRouter.html

### Performing custom actions

If you're trying to perform an action not built-in to the Notification system. You're likely trying to perform your own
custom action. This can be achieved by setting action to on of the following action types: `ActionTypes.TRANSMIT`,
`ActionTypes.QUERY` and `ActionTypes.PUBLISH`. Using these action types you're able to set up a connection between
clicking an action and performing an action not already defined.

Notice that the action type names correspond to the communication pattern methods provided by the RouterClient. To use
this, specify the `action.type` to set the communication pattern you wish to use, set the `action.channel` to on
transmit on, and the `action.payload` to set the data you wish to send.

_(See [sending notifications](/components/notify) for details on the notification client setup and sending.)_

```typescript
action.type = ActionTypes.TRANSMIT;
action.payload = { data: "hello action" };
action.channel = "channel-on-the-router";
action.buttonText = "Perform Action";
```

In your service (or component) listen on the specified channel using the corresponding method for incoming data to
perform your custom action.

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
