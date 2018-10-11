/**
 * Drawings redux reducer for actions related to drawings and drawing toolbar
 * @module reducers/drawingReducer
 */

import Types from '../actions/drawActions'

// load all drawings, with exclusions
let tools = CIQ.Drawing.getDrawingToolList({retracement:true});
let toolsArray = Object.keys(tools).map((key) => {
    return tools[key]
})

// initial state and schema
const initialState = {
    showDrawingToolbar: false,
    tools: toolsArray.sort(),
    selectedTool: null,
    fill: null,
    line: null,
    lineWidth: null,
    linePattern: null,
    fontOptions: null,
    fontFamily: 'Helvetica',
    fontSize: 13,
    fontStyle: {
        bold: false,
        italic: false
    },
    color: null
}

/**
 * Drawing redux reducer
 *
 * @param {any} [state=initialState]
 * @param {any} action
 * @returns
 */
const draw = (state = initialState, action) => {
    switch(action.type){
        case Types.TOGGLE_DRAWING:
            let elem = document.getElementById('chartContainer'),
            flipToolbar = !state.showDrawingToolbar

            if(flipToolbar){
                elem.classList.add('toolbarOn')
            }else{
                elem.classList.remove('toolbarOn')
            }

            return Object.assign({}, state, {
                showDrawingToolbar: flipToolbar
            })
        case Types.SET_FONT_FAMILY:
            return Object.assign({}, state, {
                fontFamily: action.family
            })
        case Types.SET_FONT_SIZE:
            return Object.assign({}, state, {
                fontSize: action.size + 'px'
            })
        case Types.SET_FONT_STYLE:
            if (action.styleType==="bold"){
                return Object.assign({}, state, {
                    fontStyle: {
                        bold: !state.fontStyle.bold,
                        italic: state.fontStyle.italic
                    }
                })
            }else if (action.styleType==="italic"){
                return Object.assign({}, state, {
                    fontStyle: {
                        bold: state.fontStyle.bold,
                        italic: !state.fontStyle.italic
                    }
                })
            }else return state
        case Types.SET_FILL_STYLE:
            return Object.assign({}, state, {
                fill: action.style
            })
        case Types.SET_FILL_COLOR:
            return Object.assign({}, state, {
                fill: CIQ.hexToRgba('#' + action.color)
            })
        case Types.SET_LINE_COLOR:
            return Object.assign({}, state, {
                line: CIQ.hexToRgba('#' + action.color)
            })
        case Types.CHANGE_TOOL:
            return Object.assign({}, state, {
                selectedTool: action.tool.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}),
                fontOptions: action.params.font ? action.params.font : null,
                fontSize: action.params.font ? action.params.font.size : state.fontSize,
                fontFamily: action.params.font ? action.params.font.family : state.fontFamily,
                fill: action.params ? action.params.fillColor : null,
                line: action.params ? action.params.color : null,
                lineWidth: action.params ? action.params.lineWidth : null,
                linePattern: action.params ? action.params.pattern : null
            })
        case Types.CHANGE_LINE_PARAMS:
            return Object.assign({}, state, {
                lineWidth: action.weight,
                linePattern: action.pattern
            })
        default:
            return state
    }
}

export default draw
