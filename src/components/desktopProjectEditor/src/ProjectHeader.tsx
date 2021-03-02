/*!
 * Copyright 2017 - 2020 by ChartIQ, Inc.
 * All rights reserved.
 */

import React, { useState, useEffect } from "react";

import AutosizeInput from "react-input-autosize";
import { DesktopProjectClient } from "../desktopProjectClient";

import * as Types from "./common/types";

export const ProjectHeader = (props: { onSaveProjectName: Function; projectName: string }) => {
	const { projectName, onSaveProjectName } = props;
	const [isEditingProjectName, setIsEditingProjectName] = useState(false);
	const [tmpProjectName, setTmpProjectName] = useState(projectName);

	const isProjectNameValid = DesktopProjectClient.checkValidProjectName(tmpProjectName);

	const cancelEdit = () => {
		setTmpProjectName(props.projectName);
		setIsEditingProjectName(false);
	};

	const saveEdit = () => {
		setIsEditingProjectName(false);
		onSaveProjectName(tmpProjectName);
	};

	return (
		<form
			className={[
				"project-header",
				isEditingProjectName ? "is-editing-project-name" : "",
				isProjectNameValid ? "" : "is-invalid-project-name",
			].join(" ")}
			onSubmit={(e) => {
				e.preventDefault();
			}}
		>
			<div
				className="project-name-container"
				onClick={(e) => {
					setIsEditingProjectName(true);
				}}
			>
				<AutosizeInput
					className="project-name-field"
					name="project-name"
					type="text"
					value={tmpProjectName}
					placeholder="Untitled Project"
					style={{ fontSize: 14 }}
					onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
						if (e.key === "Escape") {
							cancelEdit();
						} else if (e.key === "Enter") {
							saveEdit();
							(e.target as HTMLInputElement).blur();
						}
					}}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
						setTmpProjectName(e.target.value);
					}}
					onFocus={() => {
						setIsEditingProjectName(true);
					}}
				/>
			</div>
			<div className="project-name-actions">
				<button
					className="name-edit-confirm"
					title="Save"
					disabled={!isProjectNameValid}
					onClick={(e) => saveEdit()}
				></button>
				<button className="name-edit-cancel" title="Cancel" onClick={(e) => cancelEdit()}></button>
			</div>
		</form>
	);
};
