/**
 * Theme edit modal dialog window component
 * @module components/Modals/ThemeModal
 */

import React from 'react'
import ColorSwatch from '../Drawing/ColorSwatch'

/**
 * Theme edit modal dialog window component
 *
 * @class ThemeModal
 * @extends {React.Component}
 */
class ThemeModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			name: '',
			placeholder: 'Name Your Theme',
			isPickingThemeColor: false
		}
		this.bindCorrectContext()
	}
	bindCorrectContext(){
		this.saveSettings = this.saveSettings.bind(this)
		this.changePickerState = this.changePickerState.bind(this)
	}
	saveSettings() {
		this.props.saveTheme(this.txtThemeName.value, this.props.themeHelper.settings);
	}
	changePickerState(isOpen){
		this.setState({
			isPickingThemeColor: isOpen
		})
	}
	render() {
		let sections = this.props.currentThemeSettings.map((option, i) => {
			let swatches = option.swatches.map((swatch, j) => {
				return (<ColorSwatch isModal={true} key={'swatch'+j} setColor={this.props.updateTheme} type={swatch.class} color={swatch.color} isPickingColor={this.state.isPickingThemeColor} changeState={this.changePickerState} />)
			})

			return (
				<div key={'section'+i} className={'dialog-item ' + option.class}>
					{option.section}
					{swatches}
				</div>
			)
		})

		if(this.props.showEditModal){
			return (
				<span className="ciq dialog-overlay">
					<div className="ciq dialog theme-dialog" style={{cursor: 'default'}}>
						<div className="cq-close" onClick={this.props.toggleThemeEditor} />
						<div className="dialog-heading">Create Custom Theme</div>
						{ sections }
						<div className="dialog-item theme-save">
							<input ref={(input) => { this.txtThemeName = input; }} className="ciq" type="text" placeholder={this.state.placeholder} defaultValue={this.props.currentThemeName} />
							<button className="pull-right ciq" onClick={this.saveSettings}>Save</button>
						</div>
						<div className="clearFloat"></div>
					</div>
				</span>
			);
		}else{
			return (
				<span></span>
			)
		}
	}
}

module.exports = ThemeModal;
