/**
 * Drawing toolbar for adding drawings to the chart
 * @module components/DrawingToolbar
 */

import React from 'react'
import ColorSwatch from './Drawing/ColorSwatch'
import LineStyle from "./Drawing/LineStyle"
import FontStyle from "./Text/FontStyle"
import Font from './Text/Font'
import Measure from './Drawing/Measure'
import MenuSelect from './shared/MenuSelect'
import AxisLabel from './Drawing/AxisLabel'
import Undo from './Drawing/Undo'
import Redo from './Drawing/Redo'
import Clear from './Drawing/Clear'

/**
 * Drawing toolbar for adding drawings to the chart
 *
 * @class DrawingToolbar
 * @extends {React.Component}
 */
class DrawingToolbar extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			currentToolHasLabels: false,
			toolTitle: 'Select Tool'
		};
	}
	componentDidMount(){
		this.bindCorrectContext();
	}
	bindCorrectContext(){
		this.changeFontStyle = this.changeFontStyle.bind(this)
		this.changeFontFamily = this.changeFontFamily.bind(this)
		this.changeFontSize = this.changeFontSize.bind(this)
		this.changeLineStyle = this.changeLineStyle.bind(this)
		this.setColor = this.setColor.bind(this)
		this.changePickerState = this.changePickerState.bind(this)
		this.openMenu = this.openMenu.bind(this)
		this.closeMenu = this.closeMenu.bind(this)
	}
	componentWillReceiveProps(nextProps){
		if(nextProps.showDrawingToolbar && !this.props.showDrawingToolbar) {
			this.props.draw()
		}
	}
	toTitleCase(str) {
		return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
	}
	setTool(ciq, tool){
		if (ciq === null) {
			return
		}
		if(tool=='callout' || tool=='annotation') { // no need to do this every time
			// Sync the defaults for font tool
			var style=ciq.canvasStyle("stx_annotation");
			ciq.currentVectorParameters.annotation.font.size=style.fontSize
			ciq.currentVectorParameters.annotation.font.family=style.fontFamily
			ciq.currentVectorParameters.annotation.font.style=style.fontStyle
			ciq.currentVectorParameters.annotation.font.weight=style.fontWeight
		}
		let toolParams = CIQ.Drawing.getDrawingParameters(ciq, tool)
		this.props.changeTool(tool, toolParams)
		this.props.changeVectorParams(tool)
		this.setState({
			currentToolHasLabels: toolParams.hasOwnProperty('axisLabel'),
			toolTitle: this.toTitleCase(tool)
		});

	}
	changeFontStyle(type){
		this.props.setFontStyle(type)
		this.props.changeVectorStyle(type, { bold: this.props.fontStyle.bold, italic: this.props.fontStyle.italic })
	}
	changeFontFamily(family){
		this.props.setFontFamily(family)
		this.props.changeVectorStyle('family', { family: family })
	}
	changeFontSize(size){
		this.props.setFontSize(size)
		this.props.changeVectorStyle('size', { size: size })
	}
	changeLineStyle(weight, pattern){
		this.props.setLineParams(weight, pattern)
		this.props.changeVectorLineParams(weight, pattern)
	}
	setColor(color, type){
		if(type==="line"){
			this.props.setLineColor(color)
			this.props.changeVectorStyle('lineColor', { color: color })
		}else if(type==="fill"){
			this.props.setFillColor(color)
			this.props.changeVectorStyle('fillColor', { color: color })
		}else { return }

		this.setState({
			showColorPicker: false
		});
	}
	changePickerState(isOpen){
		this.setState({
			isPickingDrawColor: isOpen
		})
	}
	openMenu(){
		this.setState({
			menuOpen: true
		})
	}
	closeMenu(){
		this.setState({
			menuOpen: false
		})
	}
	render() {
		let menuDisplay = {
			display: this.state.menuOpen ? 'block' : 'none'
		}

		if(this.props.showDrawingToolbar){
			return (
				<div className="toolbar">
					<MenuSelect hasButtons={false}
								options={this.props.tools}
								keyName='tool'
								handleOptionSelect={this.setTool.bind(this)}
								menuId='toolSelect'
								title={this.state.toolTitle}
								needsCiq={true}
								ciq={this.props.ciq}
								labelNeedsTransform={true}
								labelTransform={this.toTitleCase}
								handlesOwnContent={true} />
					<span>
						<div className="drawingParameters">
							<ColorSwatch name="Line" type="line" setColor={this.setColor} color={this.props.line} isPickingColor={this.state.isPickingDrawColor} changeState={this.changePickerState} />
 							<ColorSwatch name="Fill" type="fill" setColor={this.setColor} color={this.props.fill} isPickingColor={this.state.isPickingDrawColor} changeState={this.changePickerState} />
							<LineStyle {...this.props} onClick={this.changeLineStyle} />
							<FontStyle {...this.props} onClick={this.changeFontStyle} />
							<Font {...this.props} onFamilyClick={this.changeFontFamily} onSizeClick={this.changeFontSize} />
							<Measure {...this.props} />
							<AxisLabel {...this.props} hasLabels={this.state.currentToolHasLabels} />
						</div>
						<div className="undoSection">
							<Undo {...this.props} />
							<Redo {...this.props} />
							<Clear {...this.props} />
						</div>
					</span>
				</div>
			)
		}else{
			return (
				<span></span>
			)
		}
	}
}

module.exports = DrawingToolbar;
