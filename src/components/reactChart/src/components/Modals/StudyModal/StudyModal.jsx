/**
 * Study modal dialog window component
 * @module components/Modals/StudyModal/StudyModal
 */

import React from 'react'
import StudyModalInput from './StudyModalInput'
import StudyModalOutput from './StudyModalOutput'
import StudyModalParameter from './StudyModalParameter'
import ColorSwatch from '../../Drawing/ColorSwatch'

/**
 * Study modal dialog window
 *
 * @class StudyModal
 * @extends {React.Component}
 */
class StudyModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			name: "",
			outputs: {},
			inputs: {},
			parameters: {},
			isPickingStudyColor: false
		};
		this.bindCorrectContext()
	}
	bindCorrectContext(){
		this.updateStudy = this.updateStudy.bind(this)
		this.updateInputs = this.updateInputs.bind(this)
		this.setColor = this.setColor.bind(this)
		this.changePickerState = this.changePickerState.bind(this)
	}
	componentWillReceiveProps(nextProps){
		if(this.props.studyHelper !== nextProps.studyHelper && nextProps.studyHelper !== null){
			this.setState({
				name: nextProps.studyHelper.name,
				outputs: nextProps.studyHelper.outputs,
				inputs: nextProps.studyHelper.inputs,
				parameters: nextProps.studyHelper.parameters
			})
		}
	}
	changePickerState(isOpen){
		this.setState({
			isPickingStudyColor: isOpen
		})
	}
	setColor(color, type, name) {
		let newOutputs = this.state.outputs,
		newInputs = this.state.inputs

		if (type==="output"){
			newOutputs = this.state.outputs.map((output, i) => {
				if(name===output.heading){
					output.color = CIQ.hexToRgba('#'+color)
				}
				return output
			})
		}else if (type==="input"){
			newInputs = this.state.inputs.map((input, i) => {
				if(name===input.heading){
					input.color = CIQ.hexToRgba('#'+color)
				}
				return input
			})
		}else return

		this.setState({
			inputs: newInputs,
			outputs: newOutputs
		})
	}
	updateStudy() {
		var currentInputs = {};
		var currentOutputs = {};
		var currentParams = {};
		for (var i = 0; i < this.state.inputs.length; i++) {
        currentInputs[this.state.inputs[i].name]=this.state.inputs[i].value;
		}
		for (var x = 0; x < this.state.outputs.length; x++) {
			currentOutputs[this.state.outputs[x].name] = this.state.outputs[x].color;
		}
		for (var y = 0; y < this.state.parameters.length; y++) {
			currentParams[this.state.parameters[y].name + 'Value'] = this.state.params[y].value;
			currentParams[this.state.parameters[y].name + 'Color'] = this.state.params[y].color;
		}

		this.props.updateStudy(currentInputs, currentOutputs, currentParams)
	}
	updateInputs(name, event){
		let target = event.target
		for (let input of this.state.inputs) {
			if (input.name === name) {
				if (input.type === "checkbox") {
					input.value = target.checked;
				} else {
					input.value = target.value;
				}
				break;
			}
		}
		this.forceUpdate();
	};
	render() {

		if (!this.props.showStudyModal || !this.props.studyHelper) return <span></span>

		let inputs = this.state.inputs.map((input, i) => {
			return (<StudyModalInput key={'input'+i} input={input} updateInputs={this.updateInputs} />)
		})

		let outputs = this.state.outputs.map((output, i) => {
			return (<StudyModalOutput key={'output'+i} output={output} setColor={this.setColor} isPickingStudyColor={this.state.isPickingStudyColor} changePickerState={this.changePickerState} />)
		})

		let params = this.state.parameters.map((param, i) => {
			return (<StudyModalParameter key={'param'+i} param={param} />)
		})

		return (
			<div className="dialog-overlay" id="studyDialog">
				<div className="dialog">
					<div className="cq-close" onClick={this.props.closeStudyModal}></div>
					<div className="dialog-heading">
						{this.state.name}
					</div>
					<div id="inputs">
						{inputs}
					</div>
					<div id="outputs">
						{outputs}
					</div>
					<div id="parameters">
						<div className="parameters dialog-item">
							{params}
						</div>
					</div>
					<button className="pull-right" onClick={this.updateStudy}>Save</button>
					<div className="clearFloat"></div>
				</div>
			</div>
		)
	}
}

export default StudyModal
