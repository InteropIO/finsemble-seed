[![Finsemble Logo](https://documentation.chartiq.com/finsemble/styles/img/Finsemble_Logo_Dark.svg)](https://documentation.chartiq.com/finsemble/)

# Message Source Test Component
This component is designed to help demonstrate how the header returned with ROuter messages can be used to track back to the source of each message, allowing a receiving component to validate that it comes from an expected source.

## Extracting header information from Router messages
Router messages are usually delivered via a handler function, e.g. for Listen/Transmit (Bus-style messages):

```javascript
const listenHandlerFn = async (err, response) => {
	if (err) {
		//error handling code here
	} else {
		//Extract the header details and interpret
		let origin = response.header.origin;
		let myClientName = FSBL.Clients.RouterClient.getClientName();
		let senderDetails = await getSenderDetails(origin);
		elements.senderDetails.value = renderSenderDetails(senderDetails, myClientName, response.header.lastClient);

		//do something with the message
		...
	}
}

FSBL.Clients.RouterClient.addListener(channel, listenHandlerFn);
```
Note that the handler function is passed a `response` value which includes both `header` and `data` fields. The data field carries the message content while the header includes the source information that we wish to analyze. The same is true for messages to or from Query responders:

```javascript
const queryHandlerFn = async (err, queryMessage) => {
	if (err) {
		//error handling code here
	} else {
		//Extract the header details and interpret
		let origin = queryMessage.header.origin;
		let myClientName = FSBL.Clients.RouterClient.getClientName();
		let senderDetails = await getSenderDetails(origin);
		elements.qrQuerySenderDetails.value = renderSenderDetails(senderDetails, myClientName, queryMessage.header.lastClient);

		//respond to query
		var response="Back at ya: " + JSON.stringify(queryMessage.data); // Responses can be objects or strings
		queryMessage.sendQueryResponse(null, response); // The callback must respond, else a timeout will occur on the querying client.
	}
}

FSBL.Clients.RouterClient.addResponder(channel, queryHandlerFn);
```

And for the query itself:
```javascript
const responseHandlerFn = async (err, response) => {
	if (err) {
		//error handling code here
	} else {
		//Extract the header details and interpret
		let origin = response.header.origin;
		let myClientName = FSBL.Clients.RouterClient.getClientName();
		let senderDetails = await getSenderDetails(origin);
		elements.qrResponseSenderDetails.value = renderSenderDetails(senderDetails, myClientName, response.header.lastClient);

		//handle the response to the query
		...
	}
}

FSBL.Clients.RouterClient.query(queryChannel, queryContent, responseHandlerFn);
```

## Message source analysis utility functions
As per the examples above, the origin RouterClient name for a message is easily retrieved from the header:
```javascript
let origin = response.header.origin;
```

The test component then makes use of the following utility functions in [messageSourceTestComponent.js](./messageSourceTestComponent.js) to gather more info on that origin:
- `clientNameToWindowName(clientName)`: 
RouterClients are named via their window name (itself usually, if not always, derived from the componentType) with 'RouterClient/' prepended. This function simply strips off the 'RouterClient.' and returns the window name.
- `windowNameToDescriptor(windowName)`: 
Uses the Finsemble Launcher API to retrieve an activeDescriptor object for a windowName. The activeDescriptor contains a variety of information about a window, including its componentType (`windowDescriptor.componentType`) and the URL it was spawned with (`windowDescriptor.url`). The URL it was spawned with is important as the `LauncherClient` allows a URL to be overridden when spawning a component, e.g. `FSBL.Clients.LauncherClient.spawn("someComponentType, {url: someURL})`. 
- `componentTypeToConfiguration(componentType)`: 
The componentType for the sending window extract from the windowDescriptor can also be used to retrieve the original configuration for the component, which includes its configured URL (`componentConfig.window.url`).
- `windowIdentifierToCurrentURL(windowIdentifier)`: 
Component instances are often referred to in Finsemble API calls via a windowIdentifier. A windowIdentifier is an object with both windowName and componentType properties (e.g. `{ "windowName": "<windowName>", "componentType": "<componentType>" };`). This function function uses a windowIdentifier to retrieve an options object and then return the current URL of the window, which can be used to determine if the window has navigated to a different URL since it was spawned. 
- `getSenderDetails(origin)`: 
Utility function that makes uses of the above functions to gather info on the message origin and return it.

For more information on ComponentTypes, WindowNames and WindowIdentifiers, please see the [Component Types and Window names tutorial](https://documentation.chartiq.com/finsemble/tutorial-ComponentTypesAndWindowNames.html).

## Validating the source of a Router Message
In order to integrate message validation into your own components, we recommend the following format for your message handler function:
```javascript
const myHandlerFn = async (err, response) => {
	if (err) {
		//error handling code here
	} else {
		//Extract the header details and interpret
		let origin = response.header.origin;
		let windowName = clientNameToWindowName(origin);
		let windowDescriptor = await windowNameToDescriptor(windowName);
		let componentType = windowDescriptor.componentType;
		let currentUrl = await windowIdentifierToCurrentURL({ componentType: componentType, windowName: windowName });
		
		//validate current URL against a list of known senders
		...
		//do something with the message
		...
	}
}
```