/**
 * Chart symbol selection
 * @module components/UI/ChartSymbol
 */

import React from 'react'
import * as chart from '../Chart'

/**
 * Chart symbol selection component
 *
 * @class ChartSymbol
 * @extends {React.Component}
 */
class ChartSymbol extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			text: ''
    }
        this.bindCorrectContext()
		}
		getPlaceholderText() {
			switch(this.props.responsiveSize){
				case(chart.ChartResponsiveSize.MEDIUM):
					return "Symbol";
				case(chart.ChartResponsiveSize.SMALL):
					return "Sym";
				default:
					return "Enter Symbol";
			}
		}
    bindCorrectContext(){
        this.onOptionClick = this.onOptionClick.bind(this);
        this.onChange = this.onChange.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
    }
	onOptionClick() {
		if (!this.props.ciq || !this.props.symbol) { return; }
		if (window.FSBL) { 
			window.FSBL.Clients.LinkerClient.publish({ dataType: 'symbol', data: this.state.text.toUpperCase() });
			FSBL.Clients.WindowClient.setWindowTitle(this.state.text.toUpperCase());
		}
		this.props.setSymbolAndSave(this.state.text);
	}
	onChange(event) {
		this.setState({
			text: event.target.value
		});
	}
	handleKeyPress(event) {
		let key = event.key;
		if (key == 'Enter') {
      this.onOptionClick()
      this.setState({text: ""})
		}
	}
	render() {
		return (
			<span className="symbol-frame">
        <input id="symbolInput" type="text" placeholder={this.getPlaceholderText()}
          onChange={this.onChange} onKeyPress={this.handleKeyPress} value={this.state.text} />
				{/* <div className="symbol-btn" onClick={this.onOptionClick}></div> */}
			</span>
		);
	}
}

export default ChartSymbol;
