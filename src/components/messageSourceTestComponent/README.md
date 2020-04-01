[![Finsemble Logo](https://documentation.chartiq.com/finsemble/styles/img/Finsemble_Logo_Dark.svg)](https://documentation.chartiq.com/finsemble/)

# Message Source Test Component
This component is designed to help demonstrate how the header returned with Router and Linker messages can be used to track back to the source of each message, allowing a receiving component to validate that it comes from an expected source.

## Extracting header information from Finsemble API messages
Router messages are usually delivered via a handler function, passed when the receiver registered with teh relevant API. These handler functions will be passed both the message data and message envelope (header) inidicating the source of the message, allow you to gather more info about that source. 

### RouterClient Listen/Transmit (Bus-style messages)

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
Note that the handler function is passed a `response` value which includes both `header` and `data` fields. The data field carries the message content while the header includes the source information that we wish to analyze. 

### RouterClient Query/Response (Used to create local APIs)
Query/Response messaging delivers queries to query responders registed for a particular channel name. It is possible to gather information on the source of a particular query:
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
and validate where the response was sent from (although i iss worth noting that Finsemble will only permit a single responder to be registered for each query channel name):
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

### LinkerClient (User controlled messaging via color channels)
The linker API is very similar to RouterClient listen/transmit, except that the user has to link components by adding them to the same color channels for messages to be delivered between them.
```javascript
const linkerSubscribeHandlerFn = async (data, envelope) => {
	//Extract the header details and interpret
	let origin = envelope.header.origin;
	let myClientName = FSBL.Clients.RouterClient.getClientName();
	let senderDetails = await getSenderDetails(origin);
	elements.senderDetails.value = renderSenderDetails(senderDetails, myClientName, response.header.lastClient);

	//do something with the Linker message
	...
	
}

FSBL.Clients.LinkerClient.subscribe(dataType, linkerSubscribeHandlerFn);
```

_N.B. the arguments differ slightly from the RouterClient APIs._

### RouterClient Pub/Sub (Stateful PubSub topics)
The Finsemble RouterClient's PubSub support requires that a PubSub responder is registered before it will receive and deliver PubSub messages. This is achieved via the [`RouterClient.addPubSubResponder()`](https://documentation.chartiq.com/finsemble/IRouterClient.html#addPubSubResponder) API call. This API call has a number of optional callback arguments which, if supplied, are run when clients publish to, subscribe to or unsubscribe from the topic, allowing for fine control over who can listen to the topic and who can publish to it. In the below example we supply the publishCallback, allowing us to process messages and determine their source before they are able to update the PubSub state and notify subscribers:

```javascript
const pubSubPublishHandlerFn = async (err, response) => {
	if (err) {
		elements.pubSubReceivedMessage.value = "Error: " + JSON.stringify(err, null, 4);
	} else {
		elements.pubSubReceivedMessage.value = JSON.stringify(response.data, null, 4);
		elements.pubSubMessageEnvelope.value = JSON.stringify(response.header, null, 4);
		let origin = response.header.origin;
		let senderDetails = await getSenderDetails(origin);

		//decide whether to allow the message to be published here
		...

		//publish on to the pubSub topic
		response.sendNotifyToAllSubscribers(null, response.data);
	}
}

let initialTopicState = { "State": "start" };
FSBL.Clients.RouterClient.addPubSubResponder(topic, initialTopicState,
	{
		publishCallback: pubSubPublishHandlerFn,
	});
```
Handlers can be applied for subscribe and unsubscribe operations as well, controlling who can subscribe and unsubscribe from the topic. See the [RouterClient tutorial](https://documentation.chartiq.com/finsemble/tutorial-TheRouter.html#third-supported-model-pubsub) and [API docs](https://documentation.chartiq.com/finsemble/IRouterClient.html#addPubSubResponder) for more info.


## Message source analysis utility functions
As per the examples above, the origin RouterClient name for a message is easily retrieved from the header:
```javascript
let origin = response.header.origin;
```

The test component then makes use of the following utility functions in [messageSourceTestComponent.js](./messageSourceTestComponent.js) to gather more info on that origin:
- [`clientNameToWindowName(clientName)`](https://github.com/ChartIQ/finsemble-seed/blob/9655e552bdc39cc37c00b4d39549578ff97a7cfa/src/components/messageSourceTestComponent/messageSourceTestComponent.js#L17-L24): 
RouterClients are named via their window name (itself usually, if not always, derived from the componentType) with 'RouterClient/' prepended. This function simply strips off the 'RouterClient.' and returns the window name.
- [`windowNameToDescriptor(windowName)`](https://github.com/ChartIQ/finsemble-seed/blob/9655e552bdc39cc37c00b4d39549578ff97a7cfa/src/components/messageSourceTestComponent/messageSourceTestComponent.js#L26-L39): 
Uses the Finsemble Launcher API to retrieve an activeDescriptor object for a windowName. The activeDescriptor contains a variety of information about a window, including its componentType (`windowDescriptor.componentType`) and the URL it was spawned with (`windowDescriptor.url`). The URL it was spawned with is important as the `LauncherClient` allows a URL to be overridden when spawning a component, e.g. `FSBL.Clients.LauncherClient.spawn("someComponentType, {url: someURL})`. 
- [`componentTypeToConfiguration(componentType)`](https://github.com/ChartIQ/finsemble-seed/blob/9655e552bdc39cc37c00b4d39549578ff97a7cfa/src/components/messageSourceTestComponent/messageSourceTestComponent.js#L66-L74): 
The componentType for the sending window extract from the windowDescriptor can also be used to retrieve the original configuration for the component, which includes its configured URL (`componentConfig.window.url`).
- [`windowIdentifierToCurrentURL(windowIdentifier)`](https://github.com/ChartIQ/finsemble-seed/blob/9655e552bdc39cc37c00b4d39549578ff97a7cfa/src/components/messageSourceTestComponent/messageSourceTestComponent.js#L41-L64): 
Component instances are often referred to in Finsemble API calls via a windowIdentifier. A windowIdentifier is an object with both windowName and componentType properties (e.g. `{ "windowName": "<windowName>", "componentType": "<componentType>" };`). This function function uses a windowIdentifier to retrieve an options object and then return the current URL of the window, which can be used to determine if the window has navigated to a different URL since it was spawned. 
- [`getSenderDetails(origin)`](https://github.com/ChartIQ/finsemble-seed/blob/9655e552bdc39cc37c00b4d39549578ff97a7cfa/src/components/messageSourceTestComponent/messageSourceTestComponent.js#L76-L102): 
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