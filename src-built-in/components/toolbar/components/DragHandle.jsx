import React from "react";
import { ReactComponent as DragHandleIcon } from "../../../../assets/img/toolbar/drag-handle.svg";

const DragHandle = () => {
	const handleMouseDown = (event) => {
		FSBL.Clients.WindowClient.startMovingWindow(event);
	};
	const handleMouseUp = () => {
		FSBL.Clients.WindowClient.stopMovingWindow();
	};

	return (
		<span
			className="cq-drag finsemble-toolbar-drag-handle"
			onMouseDown={handleMouseDown}
			onMouseUp={handleMouseUp}
		>
			<DragHandleIcon />
		</span>
	);
};

export default DragHandle;
