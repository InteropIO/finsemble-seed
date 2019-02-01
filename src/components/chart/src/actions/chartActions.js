/**
 * Chart actions for redux actions involved with the chart object
 * @module actions/chartActions
 */

import createTypes from 'redux-create-action-types';
import configs from "../../configs/ui.js";

/*
 * action types
 */
const Types = createTypes(
    'CHANGE_CHART_DATA',
    'SET_CHART_TYPE',
    'SET_CONTAINER',
    'IMPORT_LAYOUT',
    'IMPORT_DRAWINGS',
    'SET_SYMBOL',
    'ADD_COMPARISON',
    'REMOVE_COMPARISON',
    "SHARE_CHART",
    "SET_SHARE_STATUS",
    'CHANGE_VECTOR_PARAMS',
    'CHANGE_VECTOR_STYLE',
    'CHANGE_VECTOR_LINE_PARAMS',
    'TOGGLE_AXIS_LABELS',
		'SET_PERIODICITY',
		'SET_RESPONSIVE_SIZE',
    'TOGGLE_CROSSHAIRS',
    'TOGGLE_TIMEZONE_MODAL',
    'DRAW',
		'DRAWINGS_CHANGED',
		'LAYOUT_CHANGED',
    'CREATE_UNDO_STAMP',
    'UPDATE_UNDO_STAMPS',
    'UNDO',
    'REDO',
    'CLEAR'
);

export default Types;

/**
 * Set the chart container element for the ChartIQ charting library
 * async with loading panel
 *
 * @export
 * @param {String} container html element
 * @param {Function} callbacks function to call when completed
 * @returns
 */
export function setChartContainer(container, callbacks){
    return (dispatch, getState) => {

        let getCurrentComparisons = (ciq)=> {
            return Object.keys(ciq.chart.series).
            filter((s)=>ciq.chart.series[s].parameters.isComparison).
            map((s)=>ciq.chart.series[s])
        }

        return Promise.all([
            dispatch(setContainer(container, callbacks)),
            dispatch(changingChartData(true)),
            setTimeout(() => {
                let ciq = getState().chart.ciq;
                if (!window.FSBL) {
                    dispatch(importDrawings())
                    dispatch(addComparison(getCurrentComparisons(ciq)))
                }
                dispatch(changingChartData(false))
            }, 1500)
        ]);
    }
}
/**
 * Set the chart container element for the ChartIQ charting library
 *
 * @param {any} container
 * @param {any} callbacks
 * @private
 * @returns
 */
function setContainer(container, callbacks){
    return { type: 'SET_CONTAINER', container: container, callbacks: callbacks };
}

/**
 * Import drawings into the ChartIQ charting library
 *
 * @export
 * @returns
 */
export function importDrawings(){
    return { type: 'IMPORT_DRAWINGS' }
}

/**
 * Add comparison series to the chart and save layout
 *
 * @export
 * @param {any} symbol
 * @param {any} params
 * @returns
 */
export function addComparisonAndSave(symbol, params){
    return (dispatch, getState) => {
        let state = getState();
        return Promise.all([
            state.chart.ciq.addSeries(symbol, params, (err, series) => {
                dispatch(addComparison(series));
                dispatch(saveLayout());
            })
        ]);
    };
}
/**
 * Dispatch adding comparison action
 *
 * @param {String} series
 * @returns
 * @private
 */
function addComparison(series){
    return { type: 'ADD_COMPARISON', series: series }
}
/**
 * Remove comparison from chart and save layout
 *
 * @export
 * @param {any} comparison
 * @returns
 */
export function removeComparisonAndSave(comparison){
    return (dispatch) => {
        return Promise.all([
            dispatch(removeComparison(comparison)),
            dispatch(saveLayout())
        ]);
    };
}

/**
 * Dispatch remove comparison action
 *
 * @param {any} comparison
 * @returns
 * @private
 */
function removeComparison(comparison){
    return { type: 'REMOVE_COMPARISON', comparison:comparison }
}

/**
 * Toggle Crosshair mouse pointer and infographic on chart
 *
 * @export
 * @returns
 */
export function toggleCrosshairsAndSave(){
    return (dispatch) => {
        return Promise.all([
            dispatch(toggleCrosshairs()),
            dispatch(saveLayout())
        ]);
    };
}

/**
 * Dispatch toggle crosshairs action
 *
 * @returns
 * @private
 */
function toggleCrosshairs(){
    return { type: 'TOGGLE_CROSSHAIRS' }
}

/**
 * Show or hide the change timezone window
 *
 * @export
 * @returns
 */
export function toggleTimezoneModal(){
    return { type: 'TOGGLE_TIMEZONE_MODAL' }
}

/**
 * Set the timezone of intraday data on the chart
 *
 * @export
 * @param {String} zone
 * @returns
 */
export function setTimeZone(zone){
    return (dispatch, getState) => {
        let state = getState();
        return Promise.all([
						state.chart.ciq.displayZone=null,
            state.chart.ciq.setTimeZone(null, zone),
            dispatch(changingChartData(true)),
            setTimeout(() => {
                dispatch(draw()),
                dispatch(saveLayout()),
                dispatch(changingChartData(false))
            }, 1500)
        ]);
    }
}

/**
 * Set the span of the chart, displaying loading panel
 *
 * @export
 * @param {any} multiplier
 * @param {any} base
 * @param {any} interval
 * @param {any} period
 * @param {any} timeUnit
 * @returns
 */
export function setSpanWithLoader(multiplier, base, interval, period, timeUnit){
	var params = {
		multiplier: multiplier,
		base: base
	};

	if (interval) {
		params.periodicity = {
			interval: interval,
			period: period || 1,
			timeUnit: timeUnit
		}
	}

	return (dispatch, getState) => {
		var state = getState()
		return Promise.all([
            dispatch(changingChartData(true)),
            state.chart.ciq.setSpan(params, () => {
                dispatch(changingChartData(false))
                dispatch(setPeriodicity(
                    {
                        period: state.chart.ciq.layout.period,
                        interval: state.chart.ciq.layout.interval,
                        timeUnit: state.chart.ciq.layout.timeUnit
                    }
				))
            })
        ])
    }
}

/**
 * Share chart: generate image of the chart, upload it to the ChartIQ server, and produce a
 * url of the image for sharing
 *
 * @export
 * @returns
 */
export function shareChart(){
  return { type:'SHARE_CHART'}
}

/**
 * Set Share Chart dialog and state status for displaying the share chart dialog and updating
 * as processing occurs
 *
 * @export
 * @param {String} status
 * @param {String} msg error message or url of chart image
 * @returns
 */
export function setShareStatus(status, msg){
  return { type:'SET_SHARE_STATUS', status: status, msg: msg}
}

/**
 * Launch 'loading panel' to indicate asynchronous operation is refreshing chart data
 *
 * @export
 * @param {any} isChanging
 * @returns
 * @private
 */
function changingChartData(isChanging){
    return { type: 'CHANGE_CHART_DATA', changing: isChanging }
}

/**
 * Sets the current drawing parameters as described by
 * CIQ.ChartEngine#currentVectorParameters (color, pattern, etc)
 *
 * @export
 * @param {String} tool tool name
 * @returns
 */
export function changeVectorParams(tool){
    return { type: 'CHANGE_VECTOR_PARAMS', tool: tool }
}

/**
 * Sets the current drawing line parameter
 *
 * @export
 * @param {any} weight
 * @param {any} pattern
 * @returns
 */
export function changeVectorLineParams(weight, pattern){
    return { type: 'CHANGE_VECTOR_LINE_PARAMS', weight: weight, pattern: pattern }
}

/**
 * Launch 'loading panel' to indicate asynchronous operation is refreshing chart data
 *
 * @export
 * @param {any} isChanging
 * @returns
 * @private
 */
export function changeVectorStyle(type, style){
    return { type: 'CHANGE_VECTOR_STYLE', styleType: type, style: style }
}
/**
 * Sets the periodicity of the chart
 *
 * @export
 * @param {Object} periodicity
 * @see module:configs/ui
 * @returns
 */
export function setPeriodicityWithLoader(periodicity) {
	return (dispatch, getState) => {
		var state = getState()
		return Promise.all([
			dispatch(changingChartData(true)),
			state.chart.ciq.setPeriodicity(periodicity, () => {
				dispatch(changingChartData(false))
				dispatch(setPeriodicity({
					period: state.chart.ciq.layout.period,
					interval: state.chart.ciq.layout.interval,
					timeUnit: state.chart.ciq.layout.timeUnit
				}))
			})
		])
	}
}

/**
 * Sets the periodicity of the chart
 *
 * @export
 * @param {Object} periodicity
 * @returns
 * @private
 */
function setPeriodicity(periodicity){
    return { type: 'SET_PERIODICITY', periodicity:periodicity }
}

/**
 * Sets the chart type
 *
 * @export
 * @param {Object} type {type, label} see chartTypes in config
 * @see module:configs/ui
 * @returns
 */
export function setChartType(type){
	return (dispatch, getState) => {
		let state = getState()
		let ciq = state.chart.ciq
		if (type.aggregationEdit && ciq.layout.aggregationType != type.type) {
			ciq.setChartType('none');
			ciq.setAggregationType(type.type);
		} else {
			ciq.setAggregationType(type.type)
			ciq.setChartType(type.type)
		}
		ciq.draw()
		return Promise.all([
			dispatch({ type: 'SET_CHART_TYPE', chartType: type })
		])
	}
}

/**
 * Sets the chart responsive size
 *
 * @export
 * @param {Chart.ChartResponsiveSize} size size of chart
 * @see module:configs/ui
 * @returns
 */
export function setResponsiveSize(size){
	return { type: 'SET_RESPONSIVE_SIZE', size: size }
}

/**
 * Sets the symbol of the chart and saves the layout
 *
 * @export
 * @param {String} symbol
 * @returns
 */
export function setSymbolAndSave(symbol){
	return (dispatch, getState) => {
			let state = getState();
			if(symbol && symbol !== null){
					return Promise.all([
							state.chart.ciq.newChart(symbol, null, state.ciq, () => {
									dispatch(setSymbol(symbol));
									dispatch(saveLayout());
							})
					]);
			}
			return;
	};
}


/**
 * Sets the symbol of the chart
 *
 * @param {String} symbol
 * @returns
 * @private
 */
function setSymbol(symbol){
    return { type: 'SET_SYMBOL', symbol: symbol }
}

/**
 * Initiate a redraw of the chart
 *
 * @export
 * @returns
 */
export function draw(){
    return { type: 'DRAW' }
}

/**
 * Undo the last drawing addition, movement, or deletion
 *
 * @export
 * @returns
 */
export function undo(){
    return (dispatch, getState) => {
        let state = getState();
        let undone = state.chart.undoStack.pop();
        if (undone){
            let drawings = CIQ.shallowClone(undone),
            oldDrawings = CIQ.shallowClone(state.chart.ciq.drawingObjects);
            state.chart.ciq.drawingObjects=drawings;
            return Promise.all([
                dispatch(undid(oldDrawings)),
                dispatch(draw())
            ]);
        }
    };
}

/**
 * Called after undo
 *
 * @param {any} item
 * @returns
 * @private
 */
function undid(item){
    return { type: 'UNDO', item: item }
}


/**
 * Redo last drawwing addition, movement, or deletion
 *
 * @export
 * @returns
 */
export function redo(){
    return (dispatch, getState) => {
        let state = getState();
        let redone = state.chart.redoStack.pop();
        if (redone){
            let drawings = CIQ.shallowClone(redone),
            oldDrawings = CIQ.shallowClone(state.chart.ciq.drawingObjects);
            state.chart.ciq.drawingObjects=drawings;
            return Promise.all([
                dispatch(redid(oldDrawings)),
                dispatch(draw())
            ]);
        }
    }
}

/**
 * Called after redo
 *
 * @param {any} item
 * @returns
 * @private
 */
function redid(item){
    return { type: 'REDO', item: item }
}

/**
 * Clear all drawings from the chart
 *
 * @export
 * @returns
 */
export function clear(){
    return (dispatch, getState) => {
        let state = getState();
        state.chart.ciq.clearDrawings();
    };
}

/**
 * Creates an undo stamp for the chart's current drawing state
 *
 * @export
 * @param {any} params
 * @returns
 */
export function undoStamps(params){
    return (dispatch, getState) => {
				let state = getState();
				return dispatch({ type: 'UPDATE_UNDO_STAMPS', params: params });

    }
}

/**
 * Update drawings after undo
 *
 * @export
 * @param {any} params
 * @returns
 * @private
 */
function updateUndoStamps(params){
	return { type: 'UPDATE_UNDO_STAMPS', params: params }
}

/**
 * Refresh local storage
 *
 * @export
 * @param {any} params
 * @returns
 */
export function changeDrawings(params){
    return (dispatch, getState) => {
        let state = getState(),
				tmp = params.stx.exportDrawings();
        if(tmp.length===0){
            CIQ.localStorage.removeItem(state.chart.symbol);
        }else{
            CIQ.localStorageSetItem(state.chart.symbol, JSON.stringify(tmp));
		}
        return dispatch(drawingsChanged());
    }
}

/**
 * Generate drawingsChanged action
 *
 * @returns
 * @private
 */
function drawingsChanged(){
    return { type: 'DRAWINGS_CHANGED' }
}

export function importLayout(layout, cb) {
    return { type: 'IMPORT_LAYOUT', layout: layout, cb: cb }
}

/**
 * Handle action of the chart.callbacks.laout callback
 *
 * @export
 * @returns
 */
export function layoutChanged(){
	return (dispatch, getState) => {
		let state = getState();
		return Promise.all([
			dispatch(saveLayout()),
			dispatch({type: 'LAYOUT_CHANGED'})
	]);

}
}

/**
 * Save the chart's layout
 *
 * @export
 * @returns
 */
export function saveLayout(){
    return (dispatch, getState) => {
        let state = getState(),
            savedLayout = JSON.stringify(state.chart.ciq.exportLayout({ withSymbols: true }));
        if (typeof(window.FSBL) === "undefined") {
            console.log("not in finsemble");
            CIQ.localStorageSetItem("myChartLayout", savedLayout);
            CIQ.localStorageSetItem('myChartPreferences', JSON.stringify(state.chart.ciq.exportPreferences()));
        }
    }
}

/**
 * Load the chart's layout
 *
 * @export
 * @param {Object} layout
 * @returns
 */
export function loadLayout(layout){
    return { type: 'IMPORT_LAYOUT', layout: layout }
}
