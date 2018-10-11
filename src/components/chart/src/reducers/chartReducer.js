/**
 * Chart reducer for wrapper of actions that modify the ChartIQ charting library
 * @module reducers/chartReducer
 */

import Types from '../actions/chartActions'
import * as chartComponent from '../components/Chart'

// initial state and schema
const initialState = {
  ciq: null,
  chartType: null,
  refreshInterval: 1,
	symbol: 'AAPL',
	chartTop: 0,
  showDrawingToolbar: false,
  showCrosshairs: false,
  showTimezoneModal: false,
  showAxisLabels: true,
  chartSeries: [],
  comparisons: [],
  periodicity: {
    period: 1,
    interval: 1,
    timeUnit: 'day'
	},
	responsiveSize: chartComponent.calculateResponsiveSize(),
  shareStatus: "HIDDEN",
  shareStatusMsg: null,
  showPeriodicityLoader: false,
  studyOverlay: {
    show: false,
    top: 0,
    left: 0,
    params: null
  },
  initialTool:undefined,
  drawings: [],
  canUndo: false,
  canRedo: false,
  canClear: false,
  undoStack: [],
  redoStack: []
}

/**
 * Chart redux reducer
 *
 * @param {any} [state=initialState]
 * @param {any} action
 * @returns
 */
const chart = (state = initialState, action) => {
  switch (action.type) {
		case Types.SET_CONTAINER:
      let ciq = new CIQ.ChartEngine({
        container: action.container
      })
      ciq.attachQuoteFeed(window.quoteFeedSimulator, { refreshInterval: state.refreshInterval })
      ciq.setMarketFactory(CIQ.Market.Symbology.factory);
      console.log(`not in finsemble: ${window.FSBL}`);
      let layout = window.FSBL ? null : CIQ.localStorage.getItem('myChartLayout');
      ciq.callbacks.studyOverlayEdit = action.callbacks.studyOverlayEdit;
      ciq.callbacks.studyPanelEdit = action.callbacks.studyPanelEdit;
      if (layout !== null){
        layout = JSON.parse(layout);
        ciq.importLayout(layout, { managePeriodicity: true, cb: restoreDrawings.bind(this, ciq) });
      } else {
				ciq.newChart(state.symbol, null, null, restoreDrawings.bind(this, ciq))
      }
      if (!window.FSBL) {
        let preferences = !window.FSBL && CIQ.localStorage.getItem('myChartPreferences');
        if (preferences !== null){
          preferences = JSON.parse(preferences);
          if (preferences.timeZone) {
            ciq.setTimeZone(null, preferences.timeZone);
          }
        }
      }
      return Object.assign({}, state, {
        ciq: ciq,
        periodicity: {
          period: layout ? layout.periodicity : state.periodicity.period,
          interval: layout ? layout.interval : state.periodicity.interval,
          timeUnit: layout ? layout.timeUnit : state.periodicity.timeUnit
        },
        chartType: layout ? layout.chartType : state.chartType,
        showCrosshairs: layout ? layout.crosshair : state.showCrosshairs,
				symbol: layout && layout.symbols ? layout.symbols[0].symbol.toUpperCase() : state.symbol
      })
    case Types.SET_CHART_TYPE:
      return Object.assign({}, state, {
        chartType: action.chartType.type
      })
		case Types.ADD_COMPARISON:
			if(!action.series) { return state; }
			var seriesArray = Array.isArray(action.series) ? action.series : [action.series]
      let newComparisons = state.comparisons.concat(seriesArray);
      return Object.assign({}, state, {
				comparisons: newComparisons,
				chartTop: state.ciq.chart.top
      })
    case Types.REMOVE_COMPARISON:
      newComparisons = state.comparisons.filter(comp => comp.id !== action.comparison)
      return Object.assign({}, state, {
        comparisons: newComparisons
      })
    case Types.TOGGLE_TIMEZONE_MODAL:
      return Object.assign({}, state, {
        showTimezoneModal: !state.showTimezoneModal
      })
    case Types.TOGGLE_CROSSHAIRS:
      state.ciq.layout.crosshair = !state.showCrosshairs
      return Object.assign({}, state, {
        showCrosshairs: !state.showCrosshairs
      })
    case Types.CHANGE_CHART_DATA:
      return Object.assign({}, state, {
        isLoadingPeriodicity: action.changing
      })
    case Types.CHANGE_VECTOR_PARAMS:
      let style = state.ciq.canvasStyle('stx_annotation')
      if (style) {
        state.ciq.currentVectorParameters.annotation.font.size = style.size
        state.ciq.currentVectorParameters.annotation.font.family = style.family
        state.ciq.currentVectorParameters.annotation.font.style = style.style
        state.ciq.currentVectorParameters.annotation.font.weight = style.weight
      }
      let toolbarStatus=document.getElementById('chartContainer').classList.contains('toolbarOn')
	    if(!state.initialTool) state.initialTool=action.tool;
      if(action.tool&&state.initialTool!==action.tool) state.initialTool=action.tool;
	    let tool=(!action.tool&&toolbarStatus&&state.initialTool)?state.initialTool:action.tool
      state.ciq.changeVectorType(tool)
      return state
    case Types.CHANGE_VECTOR_LINE_PARAMS:
      state.ciq.currentVectorParameters.lineWidth = action.weight
      state.ciq.currentVectorParameters.pattern = action.pattern
      return state
    case Types.CHANGE_VECTOR_STYLE:
      let type = action.styleType

      if (type === "bold") {
        state.ciq.currentVectorParameters.annotation.font.weight = !action.style.bold ? "bold" : "normal"
      } else if (type === "italic") {
        state.ciq.currentVectorParameters.annotation.font.style = !action.style.italic ? "italic" : "normal"
      } else if (type === "family") {
        state.ciq.currentVectorParameters.annotation.font.family = action.style.family
      } else if (type === "size") {
        state.ciq.currentVectorParameters.annotation.font.size = action.style.size + 'px'
      } else if (type === "lineColor") {
        state.ciq.currentVectorParameters.currentColor = CIQ.hexToRgba('#' + action.style.color)
      } else if (type === "fillColor") {
        state.ciq.currentVectorParameters.fillColor = CIQ.hexToRgba('#' + action.style.color)
      } else return state

      return state
    case Types.SET_PERIODICITY:
      return Object.assign({}, state, {
        periodicity: {
          period: action.periodicity.period,
          interval: action.periodicity.interval,
          timeUnit: action.periodicity.timeUnit
        }
      })
    case Types.SET_SYMBOL:
      return Object.assign({}, state, {
        symbol: action.symbol
			})
		case Types.SET_RESPONSIVE_SIZE:
			return Object.assign({}, state, {
				responsiveSize: action.size
			})
    case Types.SHARE_CHART:
        return state;
    case Types.SET_SHARE_STATUS:
      return Object.assign({}, state, {
          shareStatus: action.status,
          shareStatusMsg: action.msg
        })
    case Types.DRAW:
      state.ciq.draw();
      return Object.assign({}, state, {
        canUndo: state.undoStack.length > 0,
        canRedo: state.redoStack.length > 0,
        canClear: state.ciq.drawingObjects.length > 0
      });
    case Types.TOGGLE_AXIS_LABELS:
      let flipAxisLabels = !state.showAxisLabels;
      state.ciq.currentVectorParameters.axisLabel=flipAxisLabels;
      return Object.assign({}, state, {
        showAxisLabels: flipAxisLabels
      })
    case Types.DRAWINGS_CHANGED:
        let drawings = state.ciq.drawingObjects.slice();
        return Object.assign({}, state, {
          drawings: drawings
				});
		case Types.LAYOUT_CHANGED:
        return Object.assign({}, state, {
          chartTop: state.ciq.chart.top
        });
    case Types.UNDO:
        let newRedoStack = state.redoStack.slice();
        newRedoStack.push(action.item);
        return Object.assign({}, state, {
          canRedo: true,
          redoStack: newRedoStack
        });
    case Types.REDO:
        let newUndoStack = state.undoStack.slice();
        newUndoStack.push(action.item);
        return Object.assign({}, state, {
          undoStack: newUndoStack
        });
    case Types.UPDATE_UNDO_STAMPS:
        let newStack = state.undoStack.slice();
        newStack.push(action.params.before);
        return Object.assign({}, state, {
          undoStack: newStack,
          canUndo: newStack.length > 0,
          canRedo: state.redoStack.length  > 0,
          canClear: state.ciq.drawingObjects.length > 0
        });
    case Types.IMPORT_DRAWINGS:
        drawings = state.ciq.drawingObjects.slice();
        if (action.drawings && window.FSBL) restoreDrawingsFromMemory(state.ciq, action.drawings);
        return Object.assign({}, state, {
          drawings: drawings,
          canClear: drawings.length > 0
        });
    case Types.IMPORT_LAYOUT:
        let importedLayout = action.layout;
        if (importedLayout !== null){
          importedLayout = typeof importedLayout === 'string' ? JSON.parse(importedLayout) : importedLayout;
          state.ciq.importLayout(importedLayout, { managePeriodicity: true, cb: action.cb ? action.cb.bind(this, state.ciq) : restoreDrawings.bind(this, state.ciq) });
        } else {
          state.ciq.newChart(state.symbol, null, null, action.cb)
        }
        console.log('importedLayout isnt null: ', importedLayout);
        return Object.assign({}, state, {
          periodicity: {
            period: importedLayout ? importedLayout.periodicity : state.periodicity.period,
            interval: importedLayout ? importedLayout.interval : state.periodicity.interval,
            timeUnit: importedLayout ? importedLayout.timeUnit : state.periodicity.timeUnit
          },
          chartType: importedLayout ? importedLayout.chartType : state.chartType,
          showCrosshairs: importedLayout ? importedLayout.crosshair : state.showCrosshairs,
          symbol: importedLayout && importedLayout.symbols ? importedLayout.symbols[0].symbol.toUpperCase() : state.symbol
        })
    default:
      return state
    }
}

/**
 * Restore drawings from localStorage.  Allows for browser to refresh to last state.
 *
 * @param {CIQ.ChartEngine} stx Charting engine
 * @private
 */
function restoreDrawings(stx){
	if(!stx.chart.symbol) {
		return;
	}
	var memory=CIQ.localStorage.getItem(stx.chart.symbol.toUpperCase());
	if(memory!==null && !window.FSBL) restoreDrawingsFromMemory(stx, memory);
}

function restoreDrawingsFromMemory(stx, memory){
  var parsed = JSON.parse(memory);
  if (parsed) {
    stx.importDrawings(parsed);
    stx.draw();
  }
}


export default chart
