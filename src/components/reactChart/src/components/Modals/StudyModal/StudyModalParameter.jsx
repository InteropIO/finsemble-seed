/**
 * Study modal parameter
 * @module components/Modals/StudyModal/StudyModalParameter
 */

import React from 'react'
import ColorSwatch from '../../Drawing/ColorSwatch'

/**
 * Study modal parameter
 *
 * @param {Object} props
 */
const StudyModalParameter = (props) => {
    return (
        <div>
            {props.param.color ? <ColorSwatch isModal={true} name={props.param.heading} type='param' setColor={props.setColor} color={props.param.color} /> : <div></div>}
            <input type={props.param.name === 'studyOverZones' ? 'checkbox' : 'number'} />
            <div>
                {props.param.heading}
            </div>
        </div>
    )
}

export default StudyModalParameter
