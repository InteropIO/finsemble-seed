/*!
 * Copyright 2017 - 2020 by ChartIQ, Inc.
 * All rights reserved.
 */

import React, { useState, useEffect } from "react";

export const ExportDetails = (props: {
	author: string;
	companyName: string;
	description: string;
	onSaveData: Function;
}) => {
	const [author, setAuthor] = useState(props.author);
	const [companyName, setCompanyName] = useState(props.companyName);
	const [description, setDescription] = useState(props.description);

	return (
		<div className="export-details">
			<h2>Project Details</h2>

			<form
				className="export-details"
				onSubmit={(e) => {
					e.preventDefault();

					props.onSaveData({
						author,
						companyName,
						description,
					});

					e.preventDefault();
				}}
			>
				<fieldset className="project-details">
					<p>
						Fill out the details below to prepare your file for export. You will be given more options for how to export
						in the next step.
					</p>

					<div className="export-details-field">
						<label htmlFor="export-author">Author</label>
						<input
							id="export-author"
							type="text"
							value={author}
							onChange={(e) => {
								setAuthor(e.currentTarget.value);
							}}
						/>
					</div>

					<div className="export-details-field">
						<label htmlFor="export-companyName">Company Name</label>
						<input
							id="export-companyName"
							type="text"
							onChange={(e) => {
								setCompanyName(e.currentTarget.value);
							}}
						/>
					</div>

					<div className="export-details-field">
						<label htmlFor="export-description">Description</label>
						<input
							id="export-description"
							type="text"
							onChange={(e) => {
								setDescription(e.currentTarget.value);
							}}
						/>
					</div>
				</fieldset>

				<div className="export-details-actions">
					<button className="export-next" type="submit">
						Next
					</button>
				</div>
			</form>
		</div>
	);
};
