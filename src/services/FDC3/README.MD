# FDC3

- Component Config
- Preload
- Client
- Service

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
  <td>info</td>
  <td><code>FSBL.Clients.FDC3Client.DesktopAgent.open('')</code></td>
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
  <td><code>example</code></td>
</tr>

<tr>
  <td>
  <code>addContextListener(handler: ContextHandler): Listener;
  addContextListener(contextType: string, handler: ContextHandler): Listener;</code>
  </td>
  <td>description </td>
  <td>example </td>
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
  <td><code>FSBL.Clients.FDC3Client.DesktopAgent.findIntent("fdc3.call")</code></td>
</tr>

<tr>
  <td><code>findIntentsByContext(context: Context): Promise&lt;Array&lt;AppIntent>>;</code></td>
  <td></td>
  <td><code>example</code></td>
</tr>

<tr>
  <td><code>raiseIntent(intent: string, context: Context, target?: string): Promise<IntentResolution>;</code></td>
  <td></td>
  <td><code>example</code></td>
</tr>

<tr>
  <td><code>addIntentListener(intent: string, handler: ContextHandler): Listener;</code></td>
  <td></td>
  <td><code>example</code></td>
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
  <td><code>example</code></td>
</tr>
<tr>
  <td> <code>getSystemChannels(): Promise&lt;Array&lt;Channel>></code> </td>
  <td>info</td>
  <td><code>example</code></td>
</tr>
<tr>
  <td> <code>joinChannel(channelId: string): Promise&lt;void></code> </td>
  <td>info</td>
  <td><code>example</code></td>
</tr>
<tr>
  <td> <code>getCurrentChannel(): Promise&lt;void></code> </td>
  <td>info</td>
  <td><code>example</code></td>
</tr>
<tr>
  <td> <code>leaveCurrentChannel(): Promise&lt;void></code> </td>
  <td>info</td>
  <td><code>example</code></td>
</tr>
</tbody>
</table>

### Examples:

#### I know the app I want to open (it's a ChartIQ chart), I also need to send the data to this, what do I do?
  `FSBL.Clients.FDC3Client.DesktopAgent.open('chartiq chart'`

- My component can accept a context of contact how do I listen for anything wanting to send context?
  - broadcast, add context listener
- I want to send some instrument data to display a chart but I don't know which apps can handle this, what do I do?
  - Option 1 - intent resolver
  - option 2
- I want to join a multiple applications to a channel, how do I do this?
  - The end user can join

#### What if the FDC3 context types don't fit with my data?
You will need to create a custom context type. The only value required is the type -
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
When using a custom context type you will need an application to know to look for this context type or understand how to use it when you broadcast from your component