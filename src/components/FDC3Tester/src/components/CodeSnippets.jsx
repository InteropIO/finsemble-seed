import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { xonokai } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function CodeSnippets() {

  const CodeBlock = ({ children }) =>
    SyntaxHighlighter ? (
      <SyntaxHighlighter language="javascript" style={xonokai}>
        {children}
      </SyntaxHighlighter>
    ) : (
        <pre>
          <code language="javascript">{children}</code>
        </pre>
      );


  const CodeExample = ({ title, children }) =>
    <div className="code-example-box">
      <h2>{title}</h2>
      {children}
    </div>


  const CodeDetails = ({ children }) => <p>
    {children}
  </p>

  return (
    <div>
      < CodeExample title="Code Testing and Examples"
      >
        <CodeDetails>
          Use this code in any Finsemble Window that uses the FDC3Preload
          (FDC3Tester, Advanced Chart, order-summary). Open the console (ctrl + shift + i)
          to test the FDC3 preload, paste the listeners in one component and the 
          broadcast in another. Here we use the Channels API.
  </CodeDetails>
        <CodeBlock>
          {`// example usage listeners
async function FDC3ChannelsListeners() {
  // new channel for 'crims'
  const channel = await fdc3.getOrCreateChannel("crims");

  // Listening examples:
  // connect to any context
  channel.addContextListener(console.log);
  // connect to fdc3.instrument context
  channel.addContextListener("fdc3.instrument", (data) => {
    console.log(data);
  }
}
FDC3ChannelsListeners();

// example usage broadcast
async function FDC3ChannelBroadcast() {
  // new channel for 'crims'
  const channel = await fdc3.getOrCreateChannel("crims");

  // broadcast context
  channel.broadcast({
    type: "fdc3.instrument",
    name: "BRCM",
    id: {
      ticker: "BRCM",
    },
    country: {
      type: "fdc3.country",
      name: "United States of America (the)",
      id: {
        ISOALPHA2: "US",
        ISOALPHA3: "USA",
      },
    },
  });  
}
FDC3ChannelBroadcast();`}
        </CodeBlock>
      </ CodeExample>

      <CodeExample>
        <CodeDetails>
        Here we use the DesktopAgent API. If the channel of the DesktopAgent changes, 
        the listeners are automatically moved to the new channel.
        </CodeDetails>
        <CodeBlock>
          {`async function FDC3DesktopAgentListners() {
  // join 'crims' channel
  await fdc3.joinChannel(channel.id);

  // listening examples
  fdc3.addContextListener(console.log);
  // this will only log to the console if the context type matches fdc3.instrument
  fdc3.addContextListener("fdc3.instrument", console.log);
}
FDC3DesktopAgentListners();

async function FDC3DesktopAgentBroadcast() {
  // join 'crims' channel
  await fdc3.joinChannel(channel.id);

  // broadcast example
  fdc3.broadcast({
    type: "fdc3.instrument",
    name: "BRCM",
    id: {
      ticker: "BRCM",
    },
    country: {
      type: "fdc3.country",
      name: "United States of America (the)",
      id: {
        ISOALPHA2: "US",
        ISOALPHA3: "USA",
      },
    },
  });
}
FDC3DesktopAgentBroadcast();`}
        </CodeBlock>
      </CodeExample>


    </div >
  );
}
/*
`
FSBL.Clients.FDC3Client.DesktopAgent.open('ChartIQ Chart', {
  type: 'fdc3.instrument',
  name: 'Microsoft',
  id: {
    ticker: 'MSFT',
    RIC: 'MSFT.OQ',
    ISIN: 'US5949181045'
  }
})

FSBL.Clients.FDC3Client.DesktopAgent.broadcast({
  type: 'fdc3.instrument',
  name: 'Microsoft',
  id: {
    ticker: 'MSFT',
    RIC: 'MSFT.OQ',
    ISIN: 'US5949181045'
  }
})
// accept any context
FSBL.Clients.FDC3Client.DesktopAgent.addContextListener({
  type: 'fdc3.instrument',
  name: 'Microsoft',
  id: {
    ticker: 'MSFT',
    RIC: 'MSFT.OQ',
    ISIN: 'US5949181045'
  }
})
// accept only context where it's an FDC3 instrument
FSBL.Clients.FDC3Client.DesktopAgent.addContextListener({
  type: 'fdc3.instrument',
  name: 'Microsoft',
  id: {
    ticker: 'MSFT',
    RIC: 'MSFT.OQ',
    ISIN: 'US5949181045'
  }
}, context => { context.type === 'fdc3.instrument' })

FSBL.Clients.FDC3Client.DesktopAgent.findIntent("ViewInstrument")

FSBL.Clients.FDC3Client.DesktopAgent.findIntentsByContext({ type: "fdc3.instrument" })

// this uses the intent resolver ui.
// without a target it will find all apps from a list.
// with a target it will ask for permission to launch
FSBL.Clients.FDC3Client.DesktopAgent.raiseIntent("ViewInstrument", {
  type: 'fdc3.instrument',
  name: 'Microsoft',
  id: {
    ticker: 'MSFT',
    RIC: 'MSFT.OQ',
    ISIN: 'US5949181045'
  }
}, "ChartIQ Chart");

// when ViewInstrument is raised get ready to accept it, when you receive it do something with it
FSBL.Clients.FDC3Client.DesktopAgent.addIntentListener("ViewInstrument", context => { do something here  })

// if the channel does not exist it will create it
FSBL.Clients.FDC3Client.DesktopAgent.getOrCreateChannel("channel1")

// returns a list of channels - should show the return value
FSBL.Clients.FDC3Client.DesktopAgent.getSystemChannels()

FSBL.Clients.FDC3Client.DesktopAgent.joinChannel('channel1')

FSBL.Clients.FDC3Client.DesktopAgent.getCurrentChannel()


FSBL.Clients.FDC3Client.DesktopAgent.leaveCurrentChannel()


// other examples


c = await FSBL.Clients.FDC3Client.DesktopAgent.getSystemChannels()
c[0].broadcast({ type: 'abc', data: 'test' })
  `;
 */