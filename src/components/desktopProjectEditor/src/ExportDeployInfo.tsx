import React, { useState, useRef, useContext } from "react";
import { ExportContext } from "./ExportContext";

export const ExportDeployInfo = () => {
	const exportContext = useContext(ExportContext);
	const publishURLRef = useRef(null);

	const installerURL = exportContext?.deployInfo?.installerURL;

	return (
		<div className="export-publish-url">
			<input type="text" disabled value={installerURL} ref={publishURLRef} />
			<button
				title="Copy"
				aria-label="Copy"
				onClick={() => {
					// @ts-ignore
					const input = publishURLRef.current as HTMLInputElement;
					input.disabled = false;
					input.focus();
					input.select();
					document.execCommand("copy");
					input.disabled = true;
				}}
			>
				<span className="copy"></span>
			</button>
		</div>
	);
};
