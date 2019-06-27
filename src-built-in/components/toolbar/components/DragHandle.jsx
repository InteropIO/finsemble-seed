import React from 'react';
import { ReactComponent as DragHandleIcon } from '../../../../assets/img/toolbar/drag-handle.svg'


const DragHandle = () => {
	return (
		<span className="cq-drag finsemble-toolbar-drag-handle">
			<DragHandleIcon />
		</span>
	)
};

export default DragHandle;