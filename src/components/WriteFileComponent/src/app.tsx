import React, { useState } from 'react';
import ReactDOM from "react-dom";
import { FinsembleProvider } from "@finsemble/finsemble-ui/react/components/FinsembleProvider";
import "@finsemble/finsemble-ui/react/assets/css/finsemble.css";
import "../../../../assets/css/theme.css";
import ContentTypeDetector from "./ContentTypeDetector"

const WriteFileComponent = () => {
	/* Your functional react component code here */
	const [clipboardData, setClipboardData] = useState('test')
	const [contentType, setContentType] = useState('')

	const contentTypeDetector = new ContentTypeDetector(['SEDOL', 'CUSIP', 'ISIN', 'FDC3CONTACT', 'FDC3CONTACTLIST', 'FDC3COUNTRY', 'FDC3INSTRUMENT', 'FDC3INSTRUMENTLIST', 'FDC3ORGANIZATION', 'FDC3PORTFOLIO', 'FDC3POSITION', 'JSON', 'CSV', 'NUMBER'])

	const getClipboardTextOnclick = () => {
		//contentTypeDetector.test()
		FSBL.System.Clipboard.readText((clipboardData: string) => {
			setClipboardData(clipboardData)
			setContentType(contentTypeDetector.detect(clipboardData))
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
			<div>Content Type: {contentType}</div>
		</div>
	);
};

ReactDOM.render(
	<FinsembleProvider>
		<WriteFileComponent />
	</FinsembleProvider>,
	document.getElementById("WriteFileComponent-tsx")
);
