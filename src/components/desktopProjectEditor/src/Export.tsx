/*!
 * Copyright 2017 - 2020 by ChartIQ, Inc.
 * All rights reserved.
 */

import React, { useState, useEffect, useContext, useMemo } from "react";
import { View } from "./View";
import { Header } from "./Header";
import { Content } from "./Content";
import { ExportLeft } from "./ExportLeft";
import { ExportRight } from "./ExportRight";
import { ExportContext } from "./ExportContext";
import { Publish } from "./Publish";
import { ExportDeployInfo } from "./ExportDeployInfo";

export const Export = () => {
	const exportContext = useContext(ExportContext);

	const backFunction = () => null;

	return (
		<View>
			<Header onClickBackButton={backFunction()}>Publish</Header>

			<Content>
				{exportContext.isPublishing ? (
					<Publish />
				) : (
					<div>
						<div className="export-methods">
							<ExportLeft />
							<ExportRight />
						</div>
						{exportContext.deployInfo && (
							<>
								<h2>Published Projects</h2>
								<div>
									<p>Share this installer link with your team to give them access to your desktop:</p>
									<ExportDeployInfo />
								</div>
							</>
						)}
					</div>
				)}
			</Content>
		</View>
	);
};
