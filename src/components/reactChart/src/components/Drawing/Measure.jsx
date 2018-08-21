/**
 * Measure drawing component
 * @module components/Drawing/Measure
 */

import React from 'react'

/**
 * Measure drawing component
 *
 * @param {Object} props
 * @returns
 */
const Measure = (props) => {
	let selectedTool=props.selectedTool;
	let rejectList=['Callout','Annotation','Arrow','Average','Check','Crossline',
	'Focusarrow','Freeform','Heart','Horizontal','Rectangle','Star','Vertical','Xcross'];
	if(rejectList.indexOf(selectedTool)>-1){
		return null
	} else {
		return (
			<div>
				<span className="measureUnlit" id="mMeasure"></span>
			</div>
		)
	}
}
export default Measure
