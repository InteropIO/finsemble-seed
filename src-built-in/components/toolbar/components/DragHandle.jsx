import React from 'react';
import { ReactComponent as DragHandleIcon } from '../../../../assets/img/toolbar/drag-handle.svg'


const DragHandle = () => {
	const currentWindow = fin.desktop.Window.getCurrent();
	const handleMouseDown = (event) => {
		currentWindow.onMouseDown(event);
	};
	const handleMouseUp = (event) => {
		currentWindow.onMouseUp(event);
	};
	return (
		<span className="cq-drag finsemble-toolbar-drag-handle"
			onMouseDown={handleMouseDown}
			onMouseUp={handleMouseUp}
		>
			<DragHandleIcon />
		</span>
	)
};

export default DragHandle;
