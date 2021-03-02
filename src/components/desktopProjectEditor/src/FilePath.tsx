/*!
 * Copyright 2017 - 2020 by ChartIQ, Inc.
 * All rights reserved.
 */

import React, { useState, useEffect } from "react";

import * as Types from "./common/types";

export type FilePathProps = {
	id: string;
	value: string;
	onSetValue: (value: string) => void;
};

export const FilePath = ({ id, value, onSetValue }: FilePathProps) => {
	const [path, setPath] = useState(value);

	useEffect(() => {
		onSetValue(path);
	}, [path]);

	return (
		<div className="file-path-container">
			{path ? (
				<>
					<span id={id}>{path}</span>
					<div className="file-input-reset-button-container">
						<button
							onClick={() => {
								setPath("");
							}}
						>
							Reset
						</button>
					</div>
				</>
			) : (
				<>
					<input
						id={id}
						type="file"
						onChange={(e) => {
							// @ts-ignore - Electron adds File.path
							setPath(e.currentTarget.files?.[0].path || "");
						}}
					/>
				</>
			)}
		</div>
	);
};
