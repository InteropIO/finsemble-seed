/**
 * Comparison to add additional series to the chart
 * @module components/UI/Comparison
 */

import React from 'react'
import * as chart from '../Chart'

/**
 * Comparison component to add additional series to the chart
 *
 * @class Comparison
 * @extends {React.Component}
 */
class Comparison extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			text: ''
		}
		this.bindCorrectContext();
	}

	getPlaceholderText() {
		switch(this.props.responsiveSize){
			case(chart.ChartResponsiveSize.MEDIUM):
				return "Compare";
			case(chart.ChartResponsiveSize.SMALL):
				return "cf.";
			default:
				return "Add Comparison";
		}
	}

	bindCorrectContext(){
		this.onChange = this.onChange.bind(this);
		this.onOptionClick = this.onOptionClick.bind(this);
		this.handleKeyPress = this.handleKeyPress.bind(this);
	}

  onChange(event) {
		this.setState({
			text: event.target.value
		});
  }

	onOptionClick() {
		function getRandomColor() {
			var letters = '0123456789ABCDEF';
			var color = '#';
			for (var i = 0; i < 6; i++) {
				color += letters[Math.floor(Math.random() * 16)];
			}
			return color;
		}

		let seriesParams = {
			isComparison: true,
			color: getRandomColor(),
			data: {
				useDefaultQuoteFeed: true
			}
		}

    let symbolCompare = this.state.text.replace(/\s/g,'').toUpperCase();
    if(symbolCompare && !this.props.comparisons.find(comp=>comp && comp.id===symbolCompare) && symbolCompare!==this.props.symbol){
      this.props.addComparisonAndSave(symbolCompare, seriesParams)
    }

		this.setState({
			text: ''
		});
  }

	handleKeyPress(event) {
		let key = event.key;
		if (key == 'Enter') {
			this.onOptionClick();
		}
  }

	render() {
		return (
			<span className="symbol-frame">
				<input onChange={this.onChange} onKeyPress={this.handleKeyPress} id="symbolCompareInput" placeholder={this.getPlaceholderText()} type="text" value={this.state.text} />
				{/* <div className="comparison-btn" onClick={this.onOptionClick}></div> */}
			</span>
		);
	}
}

module.exports = Comparison;
