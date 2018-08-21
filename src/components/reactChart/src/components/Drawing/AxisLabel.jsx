/**
 * Axis label drawing component
 * @module components/Drawing/AxisLabel
 */

import React from 'react'

/**
 * Axis Label Component
 *
 * @param {Object} props
 * @returns
 */
const AxisLabel  = (props) => {
    let cName = props.showAxisLabels  ? 'ciq-checkbox ciq-active' : 'ciq-checkbox';

    if (!props.hasLabels) return (<span></span>);

    return (
        <div>
            <div className="ciq-heading">Axis Label:</div>
            <span onClick={props.toggleAxisLabels} className={cName}><span></span></span>
        </div>
    );
}

export default AxisLabel
