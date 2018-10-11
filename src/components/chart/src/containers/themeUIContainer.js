/**
 * Chart container for redux container-component pattern, which connects a store
 * to a parent component through the react-redux.connect() method
 * @module containers/themeUIContainer
 */

import * as reactRedux from 'react-redux'
import * as themeActions from '../actions/themeActions'
import ThemeUI from '../components/UI/ThemeUI'

/**
 * Maps store state to component properties per react-redux
 *
 * @param {Object} state
 * @param {Object} ownProps
 */
const mapStateToProps = (state) => {
    return {
        themeHelper: state.theme.themeHelper,
        themeList: state.theme.themeList,
        showEditModal: state.theme.showEditModal,
				currentThemeSettings: state.theme.currentThemeSettings,
				currentThemeName: state.theme.currentThemeName
    }
}

/**
 * Maps dispatches to properties to expose actions to components
 *
 * @param {Function} dispatch
 * @param {*} ownProps
 */
const mapDispatchToProps = (dispatch) => {
    return {
        setThemeHelper: (ciq) => {
            dispatch(themeActions.setThemeHelper(ciq))
        },
        changeTheme: (theme) => {
            dispatch(themeActions.changeTheme(theme))
        },
        updateTheme: (color, swatch) => {
            dispatch(themeActions.updateTheme(color, swatch))
        },
        saveTheme: (name, theme) => {
            dispatch(themeActions.saveTheme(name, theme))
        },
        toggleThemeEditor: (theme) => {
            dispatch(themeActions.toggleThemeEditor(theme))
        },
        deleteTheme: (theme) => {
            dispatch(themeActions.deleteTheme(theme))
        },
        restoreThemes: () => {
            dispatch(themeActions.restoreThemes())
        }
    }
}

/**
 * Redux connection object linking the store to the Chart component
 */
const ThemeUIContainer = reactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(ThemeUI)

export default ThemeUIContainer
