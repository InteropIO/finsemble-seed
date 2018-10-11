/**
 * Menu for editing overlaying studies
 * @module components/UI/OverlayMenu
 */

import React from 'react'

/**
 * Menu for editing overlaying studies
 *
 * @param {Object} props
 */
const OverlayMenu = (props) => {
    if (props.studyOverlay.show){
        return (
            <span className="overlayMenu" style={{ top: props.studyOverlay.top, left: props.studyOverlay.left }}>
                <div className="edit" onClick={props.openStudyModal}>
                    Edit settings...
                </div>
                <div className="delete" onClick={props.removeStudy}>
                    Delete study
                </div>
            </span>
        )
    } else {
        return (<span></span>)
    }
}

export default OverlayMenu

