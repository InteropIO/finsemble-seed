/**
 * Redo drawing button
 * @module components/Drawing/Redo
 */

import React from 'react'

/**
 * Redo drawing button
 *
 * @param {Object} props
 * @returns
 */
const Redo = (props) => {
	let cName = props.canRedo ? 'ciq-btn active' : 'ciq-btn';

	return (
		<button disabled={!props.canRedo} className={cName} onClick={props.redo}>Redo</button>
	);
};

export default Redo;
