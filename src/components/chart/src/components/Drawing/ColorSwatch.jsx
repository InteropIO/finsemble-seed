/**
 * ColorSwatch
 * @module components/Drawing/ColorSwatch
 */

import React from 'react'
import PropTypes from 'prop-types'

// swatch colors
var colorPickerColors = [
	"ffffff", "ffd0cf", "ffd9bb", "fff56c", "eaeba3", "d3e8ae", "adf3ec", "ccdcfa", "d9c3eb",
	"efefef", "eb8b87", "ffb679", "ffe252", "e2e485", "c5e093", "9de3df", "b1c9f8", "c5a6e1",
	"cccccc", "e36460", "ff9250", "ffcd2b", "dcdf67", "b3d987", "66cac4", "97b8f7", "b387d7",
	"9b9b9b", "dd3e39", "ff6a23", "faaf3a", "c9d641", "8bc176", "33b9b0", "7da6f5", "9f6ace",
	"656565", "b82c0b", "be501b", "e99b54", "97a030", "699158", "00a99d", "5f7cb8", "784f9a",
	"343434", "892008", "803512", "ab611f", "646c20", "46603a", "007e76", "3e527a", "503567",
	"000000", "5c1506", "401a08", "714114", "333610", "222f1d", "00544f", "1f2a3c", "281a33"
];

/**
 * ColorSwatch component for choosing colors
 *
 * @class ColorSwatch
 * @extends {React.Component}
 */
class ColorSwatch extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            pickingColor: false,
            colors: colorPickerColors
        }
        this.bindCorrectContext()
    }
    bindCorrectContext(){
        this.togglePicker = this.togglePicker.bind(this)
        this.setColor = this.setColor.bind(this)
    }
    togglePicker(){
        let flipColorPicker = !this.state.pickingColor;

        if (this.props.changeState){
            if (flipColorPicker){ //picker trying to go from closed to open
                if(!this.props.isPickingColor){ //there are no other pickers open
                    this.setState({
                        pickingColor: flipColorPicker
                    }, () => {
                        this.props.changeState(flipColorPicker)
                    });
                }
            }else{ //picker trying to go from open to closed
                if(this.props.isPickingColor){
                    this.setState({
                        pickingColor: flipColorPicker
                    }, () => {
                        this.props.changeState(flipColorPicker)
                    });
                }
            }

        }else{
            this.setState({
                pickingColor: flipColorPicker
            })
        }
    }
    setColor(color){
        this.setState({
            pickingColor: false
        }, () => {
            if(this.props.changeState){
                this.props.changeState(false)
            }
            this.props.setColor(color, this.props.type, this.props.name)
        })
    }
    render(){
        let colors = this.state.colors.map((color, i) => {
            return (<li key={"color"+i}><a href="#" title={color} onClick={this.setColor.bind(this, color)} style={{background: '#'+color}}>{color}</a></li>)
				})

				let pickerStyle = {
            display: this.state.pickingColor ? 'block' : 'none',
            left: this.props.isModal ? '-120px' : 0,
            top: this.props.top ? this.props.top : 0
				}
				let cName = 'color-picker-swatch ' + this.props.type

				let colorStyle = { background: '' }

        if(this.props.color){
            if(this.props.color=="auto") colorStyle.background = 'white'
            else colorStyle.background = this.props.color
        }

        if(colorStyle.background !== ''){
            return (
                <div>
                    <span><div id={"swatch" + this.props.name} style={colorStyle} className={cName} onClick={this.togglePicker}></div></span>
                    <div id="colorPicker">
                        <div className="color-picker-options" style={pickerStyle}>
                            <ul>
                                {colors}
                            </ul>
                        </div>
                    </div>
                </div>
            )
        } else {
            return (
                <div></div>
            )
        }
    }
}


ColorSwatch.defaultProps = {
    name: '',
    isPickingColor: false,
    changeState: () => {}
}

ColorSwatch.propTypes = {
    type: PropTypes.string.isRequired,
    setColor: PropTypes.func.isRequired,
    isPickingColor: PropTypes.bool.isRequired,
    changeState: PropTypes.func.isRequired,
    color: PropTypes.string,
    top: PropTypes.string,
    isModal: PropTypes.bool
}

export default ColorSwatch

