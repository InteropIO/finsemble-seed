/**
 * Theme redux reducer for actions related to theme creation and saving
 * @module reducers/themeReducer
 */

import Types from '../actions/themeActions'
import themeActions from '../actions/themeActions';

// create the default theme
let builtinThemes = [
	{
		"name": "Day",
		"className": "ciq-day",
		"builtIn": true
	},
	{
		"name": "Night",
		"className": "ciq-night",
		"builtIn": true
	}
]

// default settings and options to display in UI
let defaultSettings = [{
		section: "Candle Color",
		class: "color",
		swatches: [{
			class: "colorDown",
			color: "",
			chartType: "Candle/Bar",
			item: "candleDown"
		}, {
			class: "colorUp",
			color: "",
			chartType: "Candle/Bar",
			item: "candleUp"
		}]
	},
	{
		section: "Candle Wick",
		class: "wick",
		swatches: [{
			class: "wickDown",
			color: "",
			chartType: "Candle/Bar",
			item: "wickDown"
		}, {
			class: "wickUp",
			color: "",
			chartType: "Candle/Bar",
			item: "wickUp"
		}]
	},
	{
		section: "Candle Border",
		class: "border",
		swatches: [{
			class: "borderDown",
			color: "",
			chartType: "Candle/Bar",
			item: "borderDown"
		}, {
			class: "borderUp",
			color: "",
			chartType: "Candle/Bar",
			item: "borderUp"
		}]
	},
	{
		section: "Line/Bar Chart",
		class: "lineBarChart",
		swatches: [{
			class: "lineBar",
			color: "",
			chartType: "Line",
			item: "lineBar"
		}]
	},
	{
		section: "Mountain Color",
		class: "mountainChart",
		swatches: [{
			class: "mountain",
			color: "",
			chartType: "Mountain",
			item: "mountain"
		}]
	},
	{
		section: "Background",
		class: "background",
		swatches: [{
			class: "chartBackground",
			color: "",
			chart: "Background",
			item: "chartBackground"
		}]
	},
	{
		section: "Grid Lines",
		class: "gridLines",
		swatches: [{
			class: "lines",
			color: "",
			chart: "Grid Lines",
			item: "lines"
		}]
	},
	{
		section: "Date Dividers",
		class: "dateDividers",
		swatches: [{
			class: "dividers",
			color: "",
			chart: "Grid Dividers",

			item: "dividers"
		}]
	},
	{
		section: "Axis Text",
		class: "axisText",
		swatches: [{
			class: "axis",
			color: "",
			chart: "Axis Text",
			item: "axis"
		}]
	}
]

// initial state and schema
const initialState = {
    themeList: builtinThemes.concat([{ "name": "+ New Theme" }]),
    currentThemeSettings: defaultSettings,
    currentThemeName: 'Default',
    showEditModal: false,
    themeHelper: null
}

var newState;

let newThemeSettings=undefined

/**
 * Theme react reducer
 *
 * @param {any} state
 * @param {any} action
 */
const ThemeUI = (state = initialState, action) => {
	switch(action.type){
			case Types.SET_HELPER:
            if(!action.ciq) return state
            let themeHelper = new CIQ.ThemeHelper({
                'stx': action.ciq
            })
            newThemeSettings = updateThemeSettings(themeHelper, state.currentThemeSettings)
            return Object.assign({}, state, {
								themeHelper: themeHelper,
                currentThemeSettings: newThemeSettings
						})

			case Types.CHANGE_THEME:
				if (action.theme.name.indexOf('+ New Theme') > -1) {
						return Object.assign({}, state, {
							showEditModal: true
						})
				} else {

					setTheme(state.themeHelper, action.theme)
					newThemeSettings = state.currentThemeSettings ? updateThemeSettings(state.themeHelper, state.currentThemeSettings) : defaultSettings;

					CIQ.localStorageSetItem('myChartCurrentThemeName', JSON.stringify(action.theme.name));

					return Object.assign({}, state, {
							currentThemeName: action.theme.name,
							currentThemeSettings: newThemeSettings
					})

				}

			case Types.UPDATE_THEME:
            newThemeSettings = updateThemeSettings(state.themeHelper, state.currentThemeSettings, {
                color: action.color,
                swatch: action.swatch
						})

            return Object.assign({}, state, {
                currentThemeSettings: newThemeSettings
            })
	    case Types.SAVE_THEME:
						let item = {
							    name: action.name,
							    settings: action.theme
						}
						let newThemeList = state.themeList.slice()
						let existsIndex = newThemeList.findIndex(t=>t.name.toUpperCase()==action.name.toUpperCase())

				    if((existsIndex > -1 && newThemeList[existsIndex].builtIn == true) || action.name==="+ New Theme") {
					    alert('Cannot override a built in theme');
					    return state;
				    }

						if (existsIndex > -1) {
							newThemeList.splice(existsIndex, 1, item);
						}
						else {
							newThemeList.splice(newThemeList.length-1, 0, item);
						}

						setTheme(state.themeHelper, {settings: item.settings})

						CIQ.localStorageSetItem('myChartThemes', JSON.stringify(newThemeList));
						CIQ.localStorageSetItem('myChartCurrentThemeName', JSON.stringify(action.name));

						return Object.assign({}, state, {
								currentThemeName: action.name,
								themeList: newThemeList,
								showEditModal: false
						})

				case Types.TOGGLE_THEME_EDITOR:
					newState = Object.assign({}, state)

					if(!state.showEditModal && action.theme){
						setTheme(state.themeHelper, action.theme)
						newThemeSettings = updateThemeSettings(state.themeHelper, state.currentThemeSettings)
						newState.currentThemeName = action.theme.name
						newState.currentThemeSettings = newThemeSettings
					}

					newState.showEditModal = !state.showEditModal

					return newState

		case Types.DELETE_THEME:
			let themeIndex = -1, themeName = action.theme.name;
			newThemeList = state.themeList.slice();

			newThemeList.map((theme, i) => {
				if (theme.name === action.theme.name){
					themeIndex = i;
				}
			})
			newThemeList.splice(themeIndex, 1);

			CIQ.localStorageSetItem('myChartThemes', JSON.stringify(newThemeList));
			return Object.assign({}, state, {
				themeList: newThemeList,
				currentThemeName: themeName,
				showEditModal: false,
			})
		case Types.RESTORE_THEMES:
			let restoredThemeList = JSON.parse(CIQ.localStorage.getItem('myChartThemes')) || state.themeList;
			let restoredCurrentThemeName = JSON.parse(CIQ.localStorage.getItem('myChartCurrentThemeName')) || restoredThemeList[0].name;

			newState = Object.assign({}, state)

			if(restoredThemeList){
				newState.themeList = restoredThemeList
				let currentTheme = restoredThemeList.find(t=>t.name===restoredCurrentThemeName)
				if(currentTheme){
					setTheme(state.themeHelper, currentTheme)
					newState.currentThemeName = currentTheme.name
					newState.currentThemeSettings = updateThemeSettings(state.themeHelper, defaultSettings)
				}
			}

			return newState

		default:
    	return state
    }
}

/**
 * Update theme settings in state from UI components
 *
 * @param {any} themeHelper
 * @param {any} currentSettings
 * @param {any} newParams
 */
function updateThemeSettings(themeHelper, currentSettings, newParams){
    let settings = currentSettings.slice(),
    rgbaColor = (newParams && newParams.color) ? CIQ.hexToRgba('#'+newParams.color) : null

    let newSettings = settings.map((setting) => {
        let newSetting = {
            section: setting.section,
            class: setting.class
        }, swatches = setting.swatches.map((swatch) => {
            let newSwatch = {
                class: swatch.class,
                item: swatch.item
            }, swatchNeedsNewColor = false

            if(newParams && newParams.swatch && newParams.swatch === swatch.class){
                swatchNeedsNewColor = true
            }

            if(swatch.hasOwnProperty('chart')){
                newSwatch.chart = swatch.chart
                if(rgbaColor && swatchNeedsNewColor) themeHelper.settings.chart[swatch.chart].color = rgbaColor
                newSwatch.color = themeHelper.settings.chart[swatch.chart].color
            }else if(swatch.hasOwnProperty('chartType')){
                newSwatch.chartType = swatch.chartType

                if(swatch.class.indexOf('Up')>-1 || swatch.class.indexOf('Down')>-1){
                    let capitalLetter = swatch.item.search(/(?=[A-Z])/),
                    direction = swatch.item.substring(capitalLetter).toLowerCase(),
                    item = swatch.item.substring(0, capitalLetter)

                    if (item !== 'candle'){
                        if(rgbaColor && swatchNeedsNewColor) themeHelper.settings.chartTypes[swatch.chartType][direction][item] = rgbaColor
                        newSwatch.color = themeHelper.settings.chartTypes[swatch.chartType][direction][item] || undefined
                    }else{
                        if(rgbaColor && swatchNeedsNewColor) themeHelper.settings.chartTypes[swatch.chartType][direction].color = rgbaColor
                        newSwatch.color = themeHelper.settings.chartTypes[swatch.chartType][direction].color || undefined
                    }
                }else{
                    if(rgbaColor && swatchNeedsNewColor) themeHelper.settings.chartTypes[swatch.chartType].color = rgbaColor
                    newSwatch.color = themeHelper.settings.chartTypes[swatch.chartType].color || undefined
                }
            }else{
                newSwatch.color = undefined
            }
            return newSwatch
        })
        newSetting.swatches = swatches
        return newSetting
    })

    return newSettings
}

/**
 * Set theme of charting library
 *
 * @param {any} themeHelper
 * @param {any} theme
 */
function setTheme(themeHelper, theme) {
	if (theme.settings) {
		themeHelper.settings = CIQ.clone(theme.settings);
		themeHelper.update();
	} else if (theme.builtIn === true) {
		$$$('body').className = theme.className
		var stx = themeHelper.params.stx;
		stx.styles = {};
		stx.chart.container.style.backgroundColor = "";
		if (stx.displayInitialized) {
			stx.headsUpHR();
			stx.clearPixelCache();
			stx.updateListeners("theme");
			stx.draw();
		}
	} else {
		console.error("InvalidArgument: No valid theme with properties: ", theme)
	}
}


export default ThemeUI
