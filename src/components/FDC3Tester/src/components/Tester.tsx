



import * as React from 'react'

const { useEffect, useState } = React

export default function Tester() {
  const [contextData, setContextData] = useState({})
  const [channel, setChannel] = useState({})
  const [contextType, setContextType] = useState('')

  // const FDC3: DesktopAgent = new FSBL.Clients.FDC3Client.getOrCreateDesktopAgent('global')
  useEffect(() => {
    const setUp = async () => {

      const fdc3Client: DesktopAgent = await FSBL.Clients.FDC3Client.getOrCreateDesktopAgent("crims")

      const channel: Channel = await fdc3Client.getOrCreateChannel('crims')

      fdc3Client.joinChannel(channel.id)

      channel && setChannel(channel)

      setContextType("com.crd");
      channel.addContextListener((data) => {
        setContextData(data);
      })
      channel.addContextListener(console.log)

    }
    setUp()

  }, [])


  return (
    <div>
      <h2>Channel Details</h2>
      <p>Connected to channel: {JSON.stringify(channel, null, 2)}</p>
      {/* <p>Listening for the context type: {contextType}</p> */}
      <p>Context: {JSON.stringify(contextData, null, 2)}</p>
    </div>
  )
}
