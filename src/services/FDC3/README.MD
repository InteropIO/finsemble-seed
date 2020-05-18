# FDC3
Welcome to the Finsemble FDC3 implementation. For those not familiar with FDC3 here is a summary taken from their charter:
>The mission of the Financial Desktop Connectivity and Collaboration Consortium (FDC3) is to develop specific protocols and taxonomies to advance the ability of desktop applications in financial workflows to interoperate in a plug-and-play fashion, without prior bi-lateral agreements.
They aim to do this by

The FDC3 revolves around a few core concepts; Apps, Intents and Context.
Apps - These are the applications that participate in FDC3. You can launch these applications and send data.
Intents - These are the verbs, what you would like to do e.g. _Launch a chart application_
Context - The noun, this is the data you want to share with other applications, they will in turn use this.

A good example putting all this together looks like this:
>Open (_intent_) a Chart (_app_) and send an instrument (_context_).

The Finsemble FDC3 implementation is comprised of four parts:
- Component Config
- Preload
- Client
- Service

The config is needed to enable Finsemble to understand that your application is built with FDC3 capability.

## Component Config & Preload

If you are comfortable with Finsemble config you skip to the example below and copy the sections into your component config.

### Config Sections:
**Preload:**
The preload is needed to use the FDC3 Client API, add this to the preload section.

**Toolbar Icon URL:**
The icon url is used by the intent resolver and will be used to display the logo of the your component. This URL can use the $applicationRoot or can be an external URL. Supported formats: jpg, png, svg

**FDC3:**


  Example:
```
{
  "FDC3 Component": {
    "window": {},
    "component": {
      "preload": [
        "$applicationRoot/preloads/FDC3Client.js"
				]
    },
    "foreign": {
      "services": {
        "fdc3": {
          "intents": [
            {
              "name": "fdc3.call",
              "displayName": "Call",
              "contexts": [
                "fdc3.contact"
              ]
            }
          ]
        }
      },
      "components": {
        "Toolbar": {
          "iconURL": "$applicationRoot/assets/img/Finsemble_Taskbar_Icon.png"
        }
      }
    }
  }
}
```

<hr/>

## Service
The service houses most of the logic for the FDC3 integration support but you will not need knowledge of this section unless you are contributing to the FDC3 Finsemble codebase.

<hr/>

## Client

_The FDC3 Client is added in via preload, you now have access to this client as if it were any other Finsemble client._

## API:

To get started with the API you will need to use the Finsemble FDC3 DesktopAgent -
`FSBL.Clients.FDC3Client.DesktopAgent`

**The code snippets below assume that you prepend the code with the desktop agent code snippet above.*

### App

<table>
<thead>
<tr>
  <th>API</th><th>Description</th><th>Example</th>
</tr>
</thead>
<tbody>
<tr>
  <td> <code>open(name: string, context?: Context): Promise&lt;void></code> </td>
  <td>Open a component and optionally send context for it to use.</td>
  <td><code>FSBL.Clients.FDC3Client.DesktopAgent.open('ChartIQ Chart')</code></td>
</tr>
</tbody>
</table>

<br/>

### Context
<table>
<thead>
<tr>
  <th>API</th><th>Description</th><th>Example</th>
</tr>
</thead>
<tbody>
<tr>
  <td><code>broadcast(context: Context): void</code></td>
  <td>Send context to the channel the app is currently on.</td>
  <td><code>FSBL.Clients.FDC3Client.DesktopAgent.broadcast({
        type: 'fdc3.instrument',
        name: 'Microsoft',
        id: {
                ticker: 'MSFT',
                RIC: 'MSFT.OQ',
                ISIN: 'US5949181045'
        }
})</code></td>
</tr>

<tr>
  <td>
  <code>addContextListener(handler: ContextHandler): Listener;
  addContextListener(contextType: string, handler: ContextHandler): Listener;</code>
  </td>
  <td></td>
  <td><code>FSBL.Clients.FDC3Client.DesktopAgent.addContextListener({
        type: 'fdc3.instrument',
        name: 'Microsoft',
        id: {
                ticker: 'MSFT',
                RIC: 'MSFT.OQ',
                ISIN: 'US5949181045'
        }
},context => {context.type === 'fdc3.instrument'})</code> </td>
</tr>
</tbody>
</table>

<br/>

### Intents
<table>
<thead>
<tr>
  <th>API</th><th>Description</th><th>Example</th>
</tr>
</thead>
<tbody>
<tr>
  <td><code>findIntent(intent: string, context?: Context): Promise&lt;AppIntent>;</code></td>
  <td>Open an application by name and optionally pass context to be used by that app.</td>
  <td><code>FSBL.Clients.FDC3Client.DesktopAgent.findIntent("ViewInstrument")</code></td>
</tr>

<tr>
  <td><code>findIntentsByContext(context: Context): Promise&lt;Array&lt;AppIntent>>;</code></td>
  <td></td>
  <td><code>FSBL.Clients.FDC3Client.DesktopAgent.findIntentsByContext({ type: "fdc3.instrument" })</code></td>
</tr>

<tr>
  <td><code>raiseIntent(intent: string, context: Context, target?: string): Promise<IntentResolution>;</code></td>
  <td></td>
  <td><code>FSBL.Clients.FDC3Client.DesktopAgent.raiseIntent("ViewInstrument", {
        type: 'fdc3.instrument',
        name: 'Microsoft',
        id: {
                ticker: 'MSFT',
                RIC: 'MSFT.OQ',
                ISIN: 'US5949181045'
        }
});</code></td>
</tr>

<tr>
  <td><code>addIntentListener(intent: string, handler: ContextHandler): Listener;</code></td>
  <td></td>
  <td><code>FSBL.Clients.FDC3Client.DesktopAgent.addIntentListener(
"ViewInstrument",
context => { do something here  }
)</code></td>
</tr>
</tbody>
</table>

<br/>

### Channel

A channel has this interface:
```
interface Channel {
  // properties
  id: string;
  type: string;
  displayMetadata?: DisplayMetadata;

  // methods
  broadcast(context: Context): void;
  getCurrentContext(contextType?: string): Promise<Context|null>;
  addContextListener(handler: ContextHandler): Listener;
  addContextListener(contextType: string, handler: ContextHandler): Listener;
}
```

<table>
<thead>
<tr>
  <th>API</th><th>Description</th><th>Example</th>
</tr></thead>
<tbody>
<tr>
  <td> <code> getOrCreateChannel(channelId: string): Promise&lt;Channel></code> </td>
  <td>info</td>
  <td><code>FSBL.Clients.FDC3Client.DesktopAgent.getOrCreateChannel("channel1")</code></td>
</tr>
<tr>
  <td> <code>getSystemChannels(): Promise&lt;Array&lt;Channel>></code> </td>
  <td>info</td>
  <td><code>FSBL.Clients.FDC3Client.DesktopAgent.getSystemChannels()</code></td>
</tr>
<tr>
  <td> <code>joinChannel(channelId: string): Promise&lt;void></code> </td>
  <td>info</td>
  <td><code>FSBL.Clients.FDC3Client.DesktopAgent.joinChannel('channel1')</code></td>
</tr>
<tr>
  <td> <code>getCurrentChannel(): Promise&lt;void></code> </td>
  <td>info</td>
  <td><code>FSBL.Clients.FDC3Client.DesktopAgent.getCurrentChannel()</code></td>
</tr>
<tr>
  <td> <code>leaveCurrentChannel(): Promise&lt;void></code> </td>
  <td>info</td>
  <td><code>FSBL.Clients.FDC3Client.DesktopAgent.leaveCurrentChannel()</code></td>
</tr>
</tbody>
</table>

### Examples:

#### I know the app I want to open (it's a ChartIQ chart), I also need to send the data to this, what do I do?


#### Is there a list of default context types?
Yes you can find a list of FDC3 context types here [https://fdc3.finos.org/docs/1.1/context/overview](). FDC3 context types start with "fdc3." .

#### What if the default FDC3 context types don't fit with my data structure?
You will need to create a custom context type. The only value required is the type(see below).

*Note: When broadcasting a custom context type the receiving application will need to know the content and structure of the context you are sending.*
```
interface Context {
    type: string;
    name?: string;
    id?: {
        [x:string]: string;
    },
    [x: string]: any;
}
```
An example of a finsemble custom type may look like this:

```
{
  "type": "com.finsemble.chart",
  "name": "Microsoft Mountain Chart",
  "settings": [
    {
      "type": "chart",
      "chartType": "mountain",
      "studies": [
        "bollinger",
        "ab"
      ],
      "instrument": [
        {
          "type": "fdc3.instrument",
          "name": "Microsoft",
          "id": {
            "ticker": "MSFT",
            "RIC": "MSFT.OQ",
            "ISIN": "US5949181045"
          }
        }
      ]
    }
  ]
}
```
