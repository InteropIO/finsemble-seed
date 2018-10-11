/**
 * Undo drawing button
 * @module components/Drawing/Undo
 */

import React from 'react'

/**
 * Undo drawing button
 *
 * @param {Object} props
 * @returns
 */
const Undo = (props) => {
	let cName = props.canUndo ? 'ciq-btn active' : 'ciq-btn';
	return (
		<button disabled={!props.canUndo} className={cName} onClick={props.undo}>Undo</button>
	);
};

export default Undo;
