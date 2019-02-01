/**
 * Study modal form input field generator component
 * @module components/Modals/StudyModal/StudyModalInput
 */

import React from 'react'

/**
 * Study modal form input field generator component
 *
 * @param {Object} props
 */
const StudyModalInput = (props) => {
    if(props.input.type === 'select'){
        let inputOptions = []

        for (var option in props.input.options){
            inputOptions.push(<option key={'option'+option}>{option}</option>)
        }

        return (
            <div className='inputs dialog-item'>
                <select defaultValue={props.input.value} onChange={props.updateInputs.bind(this, props.input.name)}>
                    {inputOptions}
                </select>
                <div>
                    {props.input.heading}
                </div>
            </div>
        )
    }
    else if (props.input.type === 'checkbox'){
        return (
            <div className='inputs dialog-item'>
                <input type='checkbox' checked={props.input.value} onChange={props.updateInputs.bind(this, props.input.name)} />
                <div>
                    {props.input.heading}
                </div>
            </div>
        )
    }
    else{
        return (
            <div className='inputs dialog-item'>
                <input type={props.input.type} defaultValue={props.input.value} onChange={props.updateInputs.bind(this, props.input.name)} />
                <div>
                    {props.input.heading}
                </div>
            </div>
        )
    }
}

export default StudyModalInput
