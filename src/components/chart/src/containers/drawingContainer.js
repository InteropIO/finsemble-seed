/**
 * Drawing container for redux container-component pattern, which connects a store
 * to a parent component through the react-redux.connect() method
 * @module containers/drawingContainer
 */

import * as reactRedux from 'react-redux'
import * as drawActions from '../actions/drawActions'
import * as chartActions from '../actions/chartActions'
import DrawingToolbar from '../components/DrawingToolbar'

/**
 * Maps store state to component properties per react-redux
 *
 * @param {Object} state
 * @param {Object} ownProps
 */
const mapStateToProps = (state, props) => {
    return {
        showDrawingToolbar: state.draw.showDrawingToolbar,
        tools: state.draw.tools,
        selectedTool: state.draw.selectedTool,
        fill: state.draw.fill,
        line: state.draw.line,
        lineWidth: state.draw.lineWidth,
        linePattern: state.draw.linePattern,
        fontOptions: state.draw.fontOptions,
        fontFamily: state.draw.fontFamily,
        fontSize: state.draw.fontSize,
        fontStyle: state.draw.fontStyle,
        color: state.draw.color
    }
}

/**
 * Maps dispatches to properties to expose actions to components
 *
 * @param {Function} dispatch
 * @param {*} ownProps
 */
const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        toggleDrawing: () => {
            dispatch(drawActions.toggleDrawing())
        },
        setFontFamily: (family) => {
            dispatch(drawActions.setFontFamily(family))
        },
        setFontStyle: (styleType) => {
            dispatch(drawActions.setFontStyle(styleType))
        },
        setFontSize: (size) => {
            dispatch(drawActions.setFontSize(size))
        },
        setFillColor: (color) => {
            dispatch(drawActions.setFillColor(color))
        },
        setLineColor: (color) => {
            dispatch(drawActions.setLineColor(color))
        },
        setFillStyle: (style) => {
            dispatch(drawActions.setLineStyle(style))
        },
        setLineParams: (weight, pattern) => {
            dispatch(drawActions.setLineParams(weight, pattern))
        },
        changeTool: (tool, params) => {
            dispatch(drawActions.changeTool(tool, params))
        },
        draw: () => {
            dispatch(chartActions.draw())
        },
        changeDrawings: (params) => {
            dispatch(chartActions.changeDrawings(params))
        }
    }
}

/**
 * Redux connection object linking the store to the Chart component
 */
const DrawingContainer = reactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(DrawingToolbar)

export default DrawingContainer
