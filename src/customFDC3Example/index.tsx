import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Context, Listener, useTitle } from "@finsemble/finsemble-core";
import "./customFDC3Example.css"
import { ICustomFdc3 } from "../customFDC3/types";

// This line imports type declarations for Finsemble's globals such as FSBL and fdc3. You can ignore any warnings that it is defined but never used.
// Please use global FSBL and fdc3 objects instead of importing from finsemble-core.
import { types } from "@finsemble/finsemble-core";

const broadcastExample = () => {
	(fdc3 as ICustomFdc3).broadcast({type: "fdc3.instrument", time: Date.now(), id: { ticker: "GME"}} as Context);
};

const publishExample = () => {
	(fdc3 as ICustomFdc3).publishToChannel({type: "fdc3.instrument", time: Date.now(), id: { ticker: "GME"}} as Context);
};


const CustomFDC3Example: React.FunctionComponent<{ title?: string }> = ({
	title,
}) => {
	const [contextListenerSummary, setContextListenerSummary] = useState<string | null>(null);
	const [channelListenerSummary, setChannelListenerSummary] = useState<string | null>(null);
	let contextListener: Listener | null = null;
	let channelListener: Listener | null = null;
	
	useTitle(title ?? "CustomFDC3Example");

	useEffect(() => {
		(fdc3 as ICustomFdc3).addContextListener(null, (context)=>{
			setContextListenerSummary(JSON.stringify(context, null, 2));
		}).then((listener) => { contextListener = listener });
	
		channelListener = (fdc3 as ICustomFdc3).addChannelListener(null, (context)=>{
			setChannelListenerSummary(JSON.stringify(context, null, 2));
		});

		return () => {
			if (contextListener) { contextListener.unsubscribe() }
			if (channelListener) { channelListener.unsubscribe() }
		};
	}, []);
	
	return (
		<div id="container">
			<h2>Custom FDC3 Example app</h2>
			<button 
				id="broadcastButton"
				onClick={broadcastExample}
			>Broadcast instrument</button>
			<button 
				id="publishButton"
				onClick={publishExample}
			>Publish instrument</button>
			<hr />
			<label>Received via <code>addContextListener</code>
				<textarea 
					id="addContextListenerArea"
					placeholder="nothing yet"
					value={contextListenerSummary ?? undefined}
				>
				</textarea>
			</label>
			<label>Received via <code>addChannelListener</code>
				<textarea 
					id="addChannelListenerArea"
					placeholder="nothing yet"
					value={channelListenerSummary ?? undefined}
				>
				</textarea>
			</label>
		</div>
	);
};

//some small delay is required for the preload to run. This should be covered by waiting for Finsemble clients with the usual ready pattern/
const main = () => {
	ReactDOM.render(
		<CustomFDC3Example />,
		document.getElementsByTagName("body")[0]
	);
};
if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", main);
} else {
	window.addEventListener("FSBLReady", main);
}
