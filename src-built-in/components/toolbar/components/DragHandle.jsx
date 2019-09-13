import React from 'react';
import { ReactComponent as DragHandleIcon } from '../../../../assets/img/toolbar/drag-handle.svg'


const DragHandle = () => {
	const currentWindow = fin.desktop.Window.getCurrent();
	return (
		<span className="cq-drag finsemble-toolbar-drag-handle"
			onMouseDown={e => currentWindow.onMouseDown(e)}
			onMouseUp={e => currentWindow.onMouseUp(e)}
		>
			<DragHandleIcon />
		</span>
	)
};

export default DragHandle;
