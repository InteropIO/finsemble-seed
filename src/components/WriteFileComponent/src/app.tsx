import React, { useState } from 'react';
import ReactDOM from "react-dom";
import { FinsembleProvider } from "@finsemble/finsemble-ui/react/components/FinsembleProvider";
import "@finsemble/finsemble-ui/react/assets/css/finsemble.css";
import "../../../../assets/css/theme.css";

const WriteFileComponent = () => {
	/* Your functional react component code here */
	const [clipboardData, setClipboardData] = useState('test')

	const getClipboardTextOnclick = () => {
		FSBL.System.Clipboard.readText((clipboardData: string) => {
			setClipboardData(clipboardData)
		})
	}

	const getClipboardHTMLOnclick = () => {
		FSBL.System.Clipboard.readHTML((clipboardData: string) => {
			setClipboardData(clipboardData)
		})
	}

	const dlAsFileOnclick = () => {
		const blob = new Blob([clipboardData], { type: 'application/json' });
		const objectUrl = URL.createObjectURL(blob);
		const tempLink = document.createElement('a');
		tempLink.style.display = 'none';
		tempLink.href = objectUrl;
		tempLink.setAttribute('download', 'test.txt');
		if (typeof tempLink.download === 'undefined') {
			tempLink.setAttribute('target', '_blank');
		}
		tempLink.click();
		window.URL.revokeObjectURL(objectUrl);
	}


	return (
		<div>
			<textarea value={clipboardData} onChange={(e) => { setClipboardData(e.target.value) }} style={{ width: '100%', height: '150px' }}></textarea>
			<button onClick={getClipboardTextOnclick}>Get Clipboard Text</button>
			<button onClick={getClipboardHTMLOnclick}>Get Clipboard HTML</button>
			<button onClick={dlAsFileOnclick}>Download as File</button>
		</div>
	);
};

ReactDOM.render(
	<FinsembleProvider>
		<WriteFileComponent />
	</FinsembleProvider>,
	document.getElementById("WriteFileComponent-tsx")
);
