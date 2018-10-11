/**
 * Chart container for redux container-component pattern, which connects a store
 * to a parent component through the react-redux.connect() method
 * @module containers/chartContainer
 */

import * as reactRedux from 'react-redux'
import * as chartActions from '../actions/chartActions'
import * as drawActions from '../actions/drawActions'
import * as studyActions from '../actions/studyActions'
import Chart from '../components/Chart'

/**
 * Maps store state to component properties per react-redux
 *
 * @param {Object} state
 * @param {Object} ownProps
 */
const mapStateToProps = (state, ownProps) => {
    return {
        ciq: state.chart.ciq,
				chartType: state.chart.chartType,
				chartTop: state.chart.chartTop,
        periodicity: state.chart.periodicity,
        isLoadingPeriodicity: state.chart.isLoadingPeriodicity,
        comparisons: state.chart.comparisons,
        service: state.chart.service,
        symbol: state.chart.symbol,
        refreshInterval: state.chart.refreshInterval,
        showCrosshairs: state.chart.showCrosshairs,
        showTimezoneModal: state.chart.showTimezoneModal,
        showAxisLabels: state.chart.showAxisLabels,
        setTimeZone: state.chart.setTimeZone,
				chartSeries: state.chart.chartSeries,
				responsiveSize: state.chart.responsiveSize,
        shareStatus: state.chart.shareStatus,
        shareStatusMsg : state.chart.shareStatusMsg,
        drawings: state.chart.drawings,
        redoStack: state.chart.redoStack,
        undoStack: state.chart.undoStack,
        canUndo: state.chart.canUndo,
        canRedo: state.chart.canRedo,
        canClear: state.chart.canClear
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
    setChartContainer: (container, callbacks) => {
      dispatch(chartActions.setChartContainer(container, callbacks))
    },
    importDrawings: () => {
      dispatch(chartActions.importDrawings())
		},
    importLayout: (layout) => {
      dispatch(chartActions.importLayout(layout))
    },
		changeDrawings: (params) => {
			dispatch(chartActions.changeDrawings(params))
		},
    changeVectorParams: (tool) => {
      dispatch(chartActions.changeVectorParams(tool))
    },
    changeVectorLineParams: (weight, pattern) => {
      dispatch(chartActions.changeVectorLineParams(weight, pattern))
    },
    changeVectorStyle: (styleType, style) => {
      dispatch(chartActions.changeVectorStyle(styleType, style))
    },
    addComparisonAndSave: (symbol, params) => {
      dispatch(chartActions.addComparisonAndSave(symbol, params))
    },
    removeComparisonAndSave: (comparison) => {
      dispatch(chartActions.removeComparisonAndSave(comparison))
    },
    toggleCrosshairsAndSave: () => {
      dispatch(chartActions.toggleCrosshairsAndSave())
    },
    toggleTimezoneModal: () => {
      dispatch(chartActions.toggleTimezoneModal())
		},
		setShareStatus: (status, msg) => {
			dispatch(chartActions.setShareStatus(status, msg))
    },
    setTimeZone: (zone) => {
      dispatch(chartActions.setTimeZone(zone))
    },
    setSymbolAndSave: (symbol) => {
      dispatch(chartActions.setSymbolAndSave(symbol))
    },
    toggleDrawingToolbar: () => {
        Promise.all([
            dispatch(drawActions.toggleDrawing()),
            dispatch(chartActions.changeVectorParams())
        ])
    },
    setPeriodicityWithLoader: (periodicity) => {
        dispatch(chartActions.setPeriodicityWithLoader(periodicity))
    },
    setChartType: (type) => {
        dispatch(chartActions.setChartType(type))
		},
		setResponsiveSize: (size) => {
			dispatch(chartActions.setResponsiveSize(size))
		},
    setSpanWithLoader: (multiplier, base, interval, period, timeUnit) => {
        dispatch(chartActions.setSpanWithLoader(multiplier, base, interval, period, timeUnit))
    },
    draw: () => {
        dispatch(chartActions.draw())
    },
    undo: (undid) => {
        dispatch(chartActions.undo(undid))
    },
    redo: () => {
        dispatch(chartActions.redo())
    },
    clear: () => {
      dispatch(chartActions.clear())
    },
    toggleAxisLabels: () => {
        dispatch(chartActions.toggleAxisLabels())
    },
    layoutChanged: () => {
      dispatch(chartActions.layoutChanged())
    },
    undoStamps: (params) => {
      dispatch(chartActions.undoStamps(params))
    },
    toggleStudyOverlay: (params) => {
      dispatch(studyActions.toggleOverlay(params))
    },
    openStudyModal: (params) => {
      dispatch(studyActions.openStudyModal(params))
    }
  }
}

/**
 * Redux connection object linking the store to the Chart component
 */
const ChartContainer = reactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(Chart)

export default ChartContainer
