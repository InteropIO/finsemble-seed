import * as React from "react";
const { useState } = React;

export default function Sender() {
	const [contextData, setContextData] = useState("");
	const [channel, setChannel] = useState("");

	const sendFDC3Data = async (channelID, context) => {
		// setup of desktop agent
		let fdc3Client = await FSBL.Clients.FDC3Client.getOrCreateDesktopAgent(
			"crims"
		);

		// new channel
		let channel = await fdc3Client.getOrCreateChannel(channelID);

		// join channel
		fdc3Client.joinChannel(channel.id);

		// broadcast context
		channel.broadcast(JSON.parse(context));
	};

	const handleSubmit = (e) => {
		sendFDC3Data(channel, contextData);
		e.preventDefault();
	};
	return (
		<div>
			<form onSubmit={handleSubmit}>
				<h2>Send context</h2>
				<br />
				<label>Send to channel:</label>
				<input
					type="text"
					name="channel"
					value={channel}
					onChange={(e) => setChannel(e.target.value)}
				/>
				<br />
				<label>
					Context data to send: <i>*this needs to be in JSON format</i>
				</label>
				<textarea
					name="context"
					cols={30}
					rows={10}
					placeholder='
          //example
					{
						"type": "fdc3.instrument",
						"name": "MSFT",
						"id": {
							"ticker": "MSFT",
							"RIC": "MSFT.OQ",
							"ISIN": "US5949181045"
						}
					}'
					value={contextData}
					onChange={(e) => {
						const vanillaString = e.target.value.replace(/[\r\n\t]+/gm, "");
						setContextData(vanillaString);
					}}
				/>
				<br />
				<input type="submit" value="Send Context" />
			</form>
		</div>
	);
}
