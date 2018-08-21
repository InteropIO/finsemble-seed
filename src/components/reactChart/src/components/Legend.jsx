/**
 * Legend for the chart
 * @module components/Legend
 */

import React from 'react'

/**
 * Legend component for the chart
 *
 * @class Legend
 * @extends {React.Component}
 */
class Legend extends React.Component{
	constructor(props){
		super(props);
		this.removeSeries = this.removeSeries.bind(this);
	}
	removeSeries(id){
		this.props.ciq.removeSeries(id);
	}
	render(){
		let comparisons = this.props.comparisons.map((comparison, i) => {
			return (
				<div className='comparisonWrapper' key={'comparison'+i}>
					<div className='chartSeriesColor' style={{ 'backgroundColor': comparison.parameters.color }}></div>
					<div className='chartSeries'>{comparison.display}</div>
					<div className='deleteSeries' onClick={this.removeSeries.bind(this, comparison.id)}></div>
				</div>
			);
		});
		return (
			<div className='comparisons' style={{marginTop: (this.props.chartTop || 0) + 35}}>
				{comparisons}
			</div>
		);
	}
}

export default Legend;

