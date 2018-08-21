/**
 * Crosshairs toggle button
 * @module components/UI/Crosshairs
 */

import React from 'react'

/**
 * Crosshairs toggle button component
 *
 * @param {Object} props
 */
const Crosshairs = (props) => {
	let cName = props.ciq.layout.crosshair ? 'crosshair-btn active' : 'crosshair-btn'
	return (
		<span><button className={cName} onClick={props.toggleCrosshairsAndSave} /></span>
	)
}

export default Crosshairs
