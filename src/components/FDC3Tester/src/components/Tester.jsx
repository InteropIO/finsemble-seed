import * as React from "react";

const { useEffect, useState } = React;

export default function Tester() {
  const [contextData, setContextData] = useState({});
  const [channel, setChannel] = useState({});

  useEffect(() => {
    const setUp = async () => {
      const fdc3Client = await FSBL.Clients.FDC3Client.getOrCreateDesktopAgent(
        "crims"
      );

      const channel = await fdc3Client.getOrCreateChannel("crims");

      fdc3Client.joinChannel(channel.id);

      channel && setChannel(channel);

      channel.addContextListener((data) => {
        setContextData(data);
      });
      channel.addContextListener(console.log);
    };
    setUp();
  });

  return (
    <div>
      <h2>Channel Details</h2>
      <p>
        Connected to channel: <b>{channel.id}</b>
      </p>
      <p>Channel details: {JSON.stringify(channel, null, 2)}</p>
      <p>
        Context Result: <br />
        {JSON.stringify(contextData, null, 2)}
      </p>
    </div>
  );
}
