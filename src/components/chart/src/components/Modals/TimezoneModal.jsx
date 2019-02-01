/**
 * Timezone selection modal dialog window component
 * @module components/Modals/TimezoneModal
 */

import React from 'react'

/**
 * Timezone selection modal dialog window component
 *
 * @class TimeZone
 * @extends {React.Component}
 */
class TimeZone extends React.Component {
	constructor(props) {
		super(props);
  }

	getTimeZoneLi() {
		return Object.keys(CIQ.timeZoneMap).
			map((zone, i) => {
        var zoneDesc = CIQ.timeZoneMap[zone];
				return (
					<li key={"zone" + zone} onClick={() => {this.setTimeZone(zoneDesc)} } className="dialog-item">{zone}</li>
					)
			})
  }

  setTimeZone(zone) {
    this.props.setTimeZone(zone);
    this.props.toggleTimezoneModal();
  }

  myTimeZone() {

    var zone = Object.keys(CIQ.timeZoneMap).find(key => CIQ.timeZoneMap[key] === this.props.ciq.displayZone);
    return zone || "your current location";

  }

  getMyZoneObj() {
      if(this.props.ciq.displayZone) {
        return (<button className="current-location-btn" onClick={()=>this.setTimeZone()}>Use my current location</button>)
      }
      else return null
    }

  render() {
    if (!this.props.showTimezoneModal) return <span></span>
    return (
      <div className="ciq dialog-overlay">
        <div className="ciq dialog timezone">
          <div className="cq-close" onClick={()=>this.props.toggleTimezoneModal()}></div>
					<div className="dialog-heading">Choose Timezone</div>
          <div className="current-location-message">To set your timezone use the location button below, or scroll through the following list.</div>
          <div className="current-location-message">Current timezone is {this.myTimeZone()}</div>
          {this.getMyZoneObj()}
          <ul className="timezoneList">
            {this.getTimeZoneLi()}
          </ul>
          <div className="instruct">(Scroll for more options)</div>
					<div className="clearFloat"></div>
        </div>
      </div>
    )
  }
}

module.exports = TimeZone;
