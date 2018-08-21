/**
 * Chart symbol selection
 * @module components/UI/TimeZoneButton
 */

import React from 'react'
import TimeZone from '../Modals/TimezoneModal';

/**
 * Time zone button component to launch time zone modal dialog window
 *
 * @param {Object} props
 */
const TimeZoneButton = (props) => {
	return (
		<span>
			<TimeZone {...props} />
			<button className="timezone-btn" onClick={props.toggleTimezoneModal} />
		</span>
	)
}

export default TimeZoneButton
