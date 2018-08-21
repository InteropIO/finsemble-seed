/**
 * Range selector component
 * @module components/RangeSelector
 */
import React from 'react'

/**
 * Range selector component
 *
 * @param {Object} props
 */
const RangeSelector = (props) => {
  function setSpan(multiplier, base, interval, period, timeUnit) {
    props.setSpanWithLoader(multiplier, base, interval, period, timeUnit)
  }
	return (
		<div>

      <div className="quick-link hide-sm" key='R8' onClick={()=>setSpan(1,'all',1,1,'month')}>All</div>
      <div className="quick-link hide-sm" key='R7' onClick={()=>setSpan(5,'year',1,1,'week')}>5Y</div>
      <div className="quick-link" key='R6' onClick={()=>setSpan(1,'year')}>1Y</div>

      <div className="quick-link hide-sm" key='R5' onClick={()=>setSpan(1,'YTD')}>YTD</div>
      <div className="quick-link hide-sm" key='R4' onClick={()=>setSpan(6,'month')}>6M</div>
      <div className="quick-link hide-sm" key='R3' onClick={()=>setSpan(3,'month')}>3M</div>

      <div className="quick-link" key='R2' onClick={()=>setSpan(1,'month',30,8,'minute')}>1M</div>
      <div className="quick-link" key='R1' onClick={()=>setSpan(5,'day',30,2,'minute')}>5D</div>
      <div className="quick-link" key='R0' onClick={()=>setSpan(1,'today')}>1D</div>

		</div>
	)
}

export default RangeSelector
