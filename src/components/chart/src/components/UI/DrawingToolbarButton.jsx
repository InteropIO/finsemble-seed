/**
 * Drawing toolbar show / hide button
 * @module components/UI/DrawingToolbarButton
 */

import React from 'react'

/**
 * Drawing toolbar show / hide button
 *
 * @param {Object} props
 */
const DrawingToolbarButton = (props) => {
	function toggleDrawingToolbar() {
		props.toggleDrawingToolbar()
	}
	return (
		<span><button className='drawing-toolbar-btn' onClick={()=>toggleDrawingToolbar()} /></span>
	)
}

export default DrawingToolbarButton
