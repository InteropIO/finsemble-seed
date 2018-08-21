/**
 * Chart container for redux container-component pattern, which connects a store
 * to a parent component through the react-redux.connect() method
 * @module containers/studyContainer
 */

import * as reactRedux from 'react-redux'
import * as studyActions from '../actions/studyActions'
import * as chartActions from '../actions/chartActions'
import StudyUI from '../components/UI/StudyUI'

/**
 * Maps store state to component properties per react-redux
 *
 * @param {Object} state
 * @param {Object} ownProps
 */
const mapStateToProps = (state) => {
    return {
        studyOverlay: state.study.studyOverlay,
        showStudyModal: state.study.showStudyModal,
        studyHelper: state.study.studyHelper,
        studyList: state.study.studyList
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
        openStudyModal: (params) => {
            dispatch(studyActions.openStudyModal(params))
        },
        closeStudyModal: () => {
            dispatch(studyActions.closeStudyModal())
        },
        toggleOverlay: (params) => {
            dispatch(studyActions.toggleOverlay(params))
        },
        addStudy: (ciq, study) => {
            dispatch(studyActions.addStudy(ciq, study))
        },
        updateStudy: (inputs, outputs, parameters) => {
            dispatch(studyActions.updateStudy(inputs, outputs, parameters))
        },
        removeStudy: (params) => {
            dispatch(studyActions.removeStudy(params))
        },
        saveLayout: () => {
            dispatch(chartActions.saveLayout())
        }
    }
}

/**
 * Redux connection object linking the store to the Chart component
 */
const StudyContainer = reactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(StudyUI)

export default StudyContainer
