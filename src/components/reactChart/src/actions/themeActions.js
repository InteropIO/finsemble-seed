/**
 * Drawing actions for redux actions involved with the theme of the chart
 * @module actions/themeActions
 */

import createTypes from 'redux-create-action-types'

/*
 * action types
 */
const Types = createTypes(
    'SET_HELPER',
    'CHANGE_THEME',
    'SAVE_THEME',
    'UPDATE_THEME',
    'TOGGLE_THEME_EDITOR',
    'DELETE_THEME',
    'RESTORE_THEMES'
)

export default Types

/**
 * Assigns the theme helper to the charting engine
 *
 * @export
 * @param {CIQ.ChartEngine} ciq
 * @returns
 */
export function setThemeHelper(ciq){
    return { type: 'SET_HELPER', ciq: ciq }
}

/**
 * Change theme
 *
 * @export
 * @param {Object} theme
 * @returns
 */
export function changeTheme(theme){
    return { type: 'CHANGE_THEME', theme: theme }
}

/**
 * Update theme configuration settings
 *
 * @export
 * @param {Object} color
 * @param {Object} swatch
 * @returns
 */
export function updateTheme(color, swatch){
    return { type: 'UPDATE_THEME', color: color, swatch: swatch }
}

/**
 * Save theme
 *
 * @export
 * @param {String} name
 * @param {Object} theme
 * @returns
 */
export function saveTheme(name, theme){
    return { type: 'SAVE_THEME', name: name, theme: theme }
}

/**
 * Show or hide the theme edit window
 *
 * @export
 * @param {Object} theme
 * @returns
 */
export function toggleThemeEditor(theme){
    return { type: 'TOGGLE_THEME_EDITOR', theme: theme }
}

/**
 * Delete theme
 *
 * @export
 * @param {Object} theme
 * @returns
 */
export function deleteTheme(theme){
    return { type: 'DELETE_THEME', theme: theme }
}

/**
 * Restore themes
 *
 * @export
 * @returns
 */
export function restoreThemes(){
    return { type: 'RESTORE_THEMES' }
}
