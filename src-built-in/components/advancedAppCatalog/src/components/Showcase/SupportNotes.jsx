/*!
 * Copyright 2017 - 2020 by ChartIQ, Inc.
 * All rights reserved.
 */
import React from "react";

//data
import storeActions from "../../stores/storeActions";

/**
 * AppShowcase support notes section.
 * @param {object} props Component props
 * @param {string} props.email The publisher's support email address
 * @param {array} props.tags An array containing the names of all tags that apply to this app
 */
const SupportNotes = (props) => {
	return (
		<div className="dev-notes support">
			<div className="support-content">
				<span className="showcase-label">Support</span>
				<div className="support">{props.email}</div>
			</div>
			<div className="tags-content">
				<span className="showcase-label">Tags</span>
				<div className="tags">
					{props.tags.map((tag, i) => {
						let tagName = tag[0].toUpperCase() + tag.substring(1);

						return (
							<div
								key={"showcase-tag-label-" + i}
								className="tag-label"
								onClick={storeActions.addTag.bind(this, tag)}
							>
								<span className="label-content">{tagName}</span>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
};

export default SupportNotes;
