import React from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { xonokai } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function CodeSnippets() {
  const codeString = `async function setUpFDC3() {
  // setup of desktop agent
  let fdc3Client = await FSBL.Clients.FDC3Client.getOrCreateDesktopAgent("crims")

  // new channel for 'crims'
  let channel = await fdc3Client.getOrCreateChannel('crims')

  // connect to any context
  channel.addContextListener(console.log)
  // connect to com.crd context
  channel.addContextListener('com.crd', (data) => {
    console.log(data);
  })

  // join 'crims' channel
  fdc3Client.joinChannel(channel.id)

  // broadcast context - unused
  /* channel.broadcast({
    type: 'com.crd',
    name: 'MSFT',
    id: {
      ticker: 'MSFT',
      RIC: 'MSFT.OQ',
      ISIN: 'US5949181045'
    }
  }) */
}
`

  const consoleSnip = `
    // listening example
    FSBL.Clients.FDC3Client.getOrCreateDesktopAgent("crims").then(fdc3 => fdc3.getOrCreateChannel('crims'))
      .then(channel => {
        channel.addContextListener(console.log)
        channel.addContextListener('com.crd', console.log)
      })

  // broadcast example
  FSBL.Clients.FDC3Client.getOrCreateDesktopAgent("crims").then(fdc3 => fdc3.getOrCreateChannel('crims'))
    .then(channel => {
      channel.broadcast({
        type: 'com.crd',
        name: 'MSFT',
        id: {
          ticker: 'MSFT',
          RIC: 'MSFT.OQ',
          ISIN: 'US5949181045'
        }
      })
    })
    `


  return (
    <div>
      <SyntaxHighlighter language="javascript" style={xonokai}>
        {consoleSnip}
      </SyntaxHighlighter>
      <SyntaxHighlighter language="javascript" style={xonokai}>
        {codeString}
      </SyntaxHighlighter>
    </div>
  );
};


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
  `