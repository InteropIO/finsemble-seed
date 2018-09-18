import React from 'react';

const DragHandle = () => {
	return (
		<span className="cq-drag finsemble-toolbar-drag-handle">
			<svg xmlns="http://www.w3.org/2000/svg" width="13" height="26" viewBox="0 0 13 26">
				<g fill="#495A69" fillRule="evenodd">
					<circle cx="2.5" cy="2.5" r="2.5" />
					<circle cx="2.5" cy="9.5" r="2.5" />
					<circle cx="10.5" cy="2.5" r="2.5" />
					<circle cx="10.5" cy="9.5" r="2.5" />
					<circle cx="2.5" cy="16.5" r="2.5" />
					<circle cx="10.5" cy="16.5" r="2.5" />
					<circle cx="2.5" cy="23.5" r="2.5" />
					<circle cx="10.5" cy="23.5" r="2.5" />
				</g>
			</svg>
			{/* look */}
		</span>
	)
};

export default DragHandle;