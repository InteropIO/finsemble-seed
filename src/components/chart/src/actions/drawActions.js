/**
 * Drawing actions for redux actions involved with the drawings on the chart
 * @module actions/drawActions
 */

import createTypes from 'redux-create-action-types'

/*
 * action types
 */
const Types = createTypes(
    'TOGGLE_DRAWING',
    'SET_FONT_FAMILY',
    'SET_FONT_SIZE',
    'SET_FONT_STYLE',
    'SET_FILL_STYLE',
    'SET_LINE_COLOR',
    'SET_FILL_COLOR',
    'CHANGE_LINE_PARAMS',
    'CHANGE_TOOL'
)

export default Types

/**
 * Show or hide the drawing toolbar
 *
 * @export
 * @returns
 */
export function toggleDrawing(){
    return { type: 'TOGGLE_DRAWING' }
}

/**
 * Set font-family for drawing config
 *
 * @export
 * @param {any} family
 * @returns
 */
export function setFontFamily(family){
    return { type: 'SET_FONT_FAMILY', family: family }
}

/**
 * Set the font-style for drawing config
 *
 * @export
 * @param {any} type
 * @returns
 */
export function setFontStyle(type){
    return { type: 'SET_FONT_STYLE', styleType: type }
}

/**
 * Set the font-size for the drawing config
 *
 * @export
 * @param {any} size
 * @returns
 */
export function setFontSize(size){
    return { type: 'SET_FONT_SIZE', size: size }
}

/**
 * Set the line color for the drawing config
 *
 * @export
 * @param {any} color
 * @returns
 */
export function setLineColor(color){
    return { type: 'SET_LINE_COLOR', color: color }
}

/**
 * Set fill color for the drawing config
 *
 * @export
 * @param {any} color
 * @returns
 */
export function setFillColor(color){
    return { type: 'SET_FILL_COLOR', color: color }
}

/**
 * Set fill style for the drawing config
 *
 * @export
 * @param {any} style
 * @returns
 */
export function setFillStyle(style){
    return { type: 'SET_FILL_STYLE', style: style }
}

/**
 * Set line parameters for the drawing config
 *
 * @export
 * @param {any} weight
 * @param {any} pattern
 * @returns
 */
export function setLineParams(weight, pattern){
    return { type: 'CHANGE_LINE_PARAMS', weight: weight, pattern: pattern }
}

/**
 * Change drawing tool
 *
 * @export
 * @param {any} tool
 * @param {any} params
 * @returns
 */
export function changeTool(tool, params){
    return { type: 'CHANGE_TOOL', tool: tool, params: params }
}
