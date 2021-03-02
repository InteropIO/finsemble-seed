/*!
 * Copyright 2017 - 2020 by ChartIQ, Inc.
 * All rights reserved.
 */

import React, { useState, useEffect } from "react";

import * as Types from "./common/types";

import { Tooltip } from "./Tooltip";

import { DesktopProjectClient as DesktopProjectClientConstructor } from "../desktopProjectClient";

const DesktopProjectClient = new DesktopProjectClientConstructor();

export const FileInput = (props: {
	value: string;
	onSetValue: Function | undefined;
	uploadFunction: Function | undefined;
	acceptTypes: string[];
}) => {
	const uploadFunction =
		props.uploadFunction || ((file: File, progress: Function) => DesktopProjectClient.uploadImage(file, progress));
	const [isUploading, setIsUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [fileObject, setFileObject] = useState({});
	const [fileInput, setFileInput] = useState({} as HTMLInputElement); // cast to correct type so typescript doesn't complain
	const [path, setPath] = useState(props.value || "");
	const [errorMessage, setErrorMessage] = useState(null as string | null);

	const uploadFile = () => {
		if (fileObject instanceof File) {
			setIsUploading(true);
			uploadFunction(fileObject, (progress: number) => {
				setUploadProgress(progress);
			})
				.then(uploadSuccess)
				.catch(uploadError)
				.finally(() => {
					setIsUploading(false);
					setUploadProgress(0);
					setFileObject({});
				});
		}
	};

	useEffect(() => {
		uploadFile();
	}, [fileObject]);

	const uploadSuccess = (response: { err: string | null; path: string }) => {
		const { err, path } = response;

		if (err) {
			setErrorMessage(err);
			setPath("");
		} else {
			setErrorMessage(null);
			setPath(path);

			if (typeof props.onSetValue === "function") {
				props.onSetValue(path);
			}

			setFileObject({});
			fileInput.value = "";
		}
	};

	const uploadError = (err: string) => {
		setErrorMessage(err);
	};

	const onFileChange = (e: any) => {
		setFileObject(e.target.files?.[0] || fileObject);
		setFileInput(e.target);
		setIsUploading(false);
		setUploadProgress(0);
		setErrorMessage(null);
	};

	return (
		<div className="file-input-container">
			<div className="file-input-actions">
				<input type="file" onChange={onFileChange} accept={props.acceptTypes.join(", ")} />
				<button>Browse</button>
			</div>
			<div className="file-input-value">
				{/* @ts-ignore - Electron implements File.path */}
				<input type="text" disabled value={fileObject.path || path}></input>
				{errorMessage && <div className="file-input-error">{errorMessage}</div>}
			</div>
			<div className="file-input-status">
				{isUploading ? (
					<div className="file-input-progress-container">{uploadProgress}% uploaded</div>
				) : (
					!errorMessage &&
					fileObject instanceof File && (
						<></>
						// <button
						// 	onClick={(e) => {
						// 		uploadFile();
						// 	}}
						// >
						// 	Upload File
						// </button>
					)
				)}
			</div>
		</div>
	);
};
