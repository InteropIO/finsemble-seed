import * as React from "react";
import { connect } from "react-redux";
import { AnyAction } from "redux";
import { ThunkDispatch } from "redux-thunk"

import ActiveExcelFileList from "./ActiveExcelFileList";
import ExcelFile from "../types/ExcelFile";
import { useEffect, useState, useRef } from "react";
import GetExcelCellsModal from "./GetExcelCellsModal";
import PreviousExcelFileList from "./PreviousExcelFileList";
import { registerActionThunk, saveExcelWorkbookThunk, setGetExcelCellDataActionModalDisplay, setSelectedActiveExcelFiles, setSelectedPreviousExcelFiles, setSetExcelCellDataActionModalDisplay } from "../redux/actions/actions";
import { ExcelAction } from "../types/types";
import * as CONSTANTS from "../redux/actions/actionTypes";
import SetExcelCellsModal from "./SetExcelCellsModal";


const ExcelTester = (props: any) => {
    const { offAddInServiceActions, registerAction } = props;
    const { selectedActiveExcelFiles, clearSelectedActiveExcelFiles } = props;
    const { selectedPreviousExcelFiles, clearSelectedPreviousExcelFiles } = props;
    const { setGetExecelCellsModalDisplay, setSetExecelCellsModalDisplay } = props
    const { saveWorkbook } = props
    const { sheetChangeEvent } = props

    let [saveWorkbookActions, setSaveWorkbookActions] = useState<Array<ExcelAction>>([])
    let [subDataChangeActions, setSubDataChangeActions] = useState<Array<ExcelAction>>([])
    let [resultTextArea, setResultTextArea] = useState("")

    useEffect(() => {
        window.onclick = (event: any) => {
            if (event.target.className == 'modal') {
                setGetExecelCellsModalDisplay('none')
                clearSelectedActiveExcelFiles()
            }
        }
        clearSelectedActiveExcelFiles()
        clearSelectedPreviousExcelFiles()
    }, [])

    useEffect(() => {
        if (offAddInServiceActions.length > 0) {
            let latestAction = offAddInServiceActions[offAddInServiceActions.length - 1]
            setResultTextArea(`${resultTextArea}${latestAction.action} registered.\n`)
        }

        let tempSaveWorkbookActions = offAddInServiceActions.filter((offAddInServiceAction: ExcelAction) => {
            return offAddInServiceAction.action === CONSTANTS.SAVE_EXCEL_WORKBOOK
        })
        if (tempSaveWorkbookActions.length > 0) {
            setSaveWorkbookActions(tempSaveWorkbookActions)
            tempSaveWorkbookActions.forEach((saveWorkbookAction: ExcelAction) => {
                saveWorkbook(saveWorkbookAction.id, saveWorkbookAction.file)
            })
        }

    }, [offAddInServiceActions])

    useEffect(() => {
        if (Object.keys(sheetChangeEvent).length > 0) {
            setResultTextArea(JSON.stringify(sheetChangeEvent, null, "\t"))
        }
    }, [sheetChangeEvent])

    const getCellDataOnClick = () => {
        if (selectedActiveExcelFiles.length > 0) {
            setGetExecelCellsModalDisplay('block')
        } else {
            alert('Please select at least 1 file!')
        }
    }

    const setCellDataOnClick = () => {
        if (selectedActiveExcelFiles.length > 0) {
            setSetExecelCellsModalDisplay('block')
        } else {
            alert('Please select at least 1 file!')
        }
    }

    const spawnExcelFile = () => {
        if (selectedPreviousExcelFiles.length > 0) {
            selectedPreviousExcelFiles.forEach((selectedPreviousFile: ExcelFile) => {
                FSBL.Clients.LauncherClient.spawn('Excel', { arguments: `${selectedPreviousFile.filePath} /x /a FinsembleExcel` });
            })
            clearSelectedPreviousExcelFiles()
        } else {
            alert('Please select at least 1 file!')
        }
    }

    const saveExcelWorkbook = () => {
        if (selectedActiveExcelFiles.length > 0) {
            // ONLY execute when selected active excel file
            if (saveWorkbookActions.length > 0) {
                // Check if there are any saveworkbook actions for each selected file
                let newSaveActions = false
                let tempSaveWorkbookActions: Array<ExcelAction> = []
                selectedActiveExcelFiles.forEach((selectedActiveExcelFile: ExcelFile) => {
                    let tempSaveWorkbookAction = saveWorkbookActions.find((offAddInServiceAction: ExcelAction) => {
                        return offAddInServiceAction.file?.fileName === selectedActiveExcelFile.fileName && offAddInServiceAction.action === CONSTANTS.SAVE_EXCEL_WORKBOOK
                    })
                    // If there are no actions, register one 
                    if (!tempSaveWorkbookAction) {
                        registerAction(CONSTANTS.SAVE_EXCEL_WORKBOOK, [selectedActiveExcelFile])
                        newSaveActions = true
                    } else {
                        tempSaveWorkbookAction.file = selectedActiveExcelFile
                        tempSaveWorkbookActions.push(tempSaveWorkbookAction)
                    }
                });
                if (!newSaveActions) {
                    tempSaveWorkbookActions.forEach((saveWorkbookAction: ExcelAction) => {
                        saveWorkbook(saveWorkbookAction.id, saveWorkbookAction.file)
                    })
                }
            } else {
                // Register action
                registerAction(CONSTANTS.SUBSCRIBE_SHEET_CHANGE, selectedActiveExcelFiles)
            }
            clearSelectedActiveExcelFiles()
        } else {
            alert('Please select at least 1 file!')
        }
    }

    const subSheetChange = () => {
        if (selectedActiveExcelFiles.length > 0) {
            // ONLY execute when selected active excel file
            selectedActiveExcelFiles.forEach((selectedActiveExcelFile: ExcelFile) => {
                let tempRegisterSheetChangeAction = offAddInServiceActions.find((offAddInServiceAction: ExcelAction) => {
                    return offAddInServiceAction.file?.fileName === selectedActiveExcelFile.fileName && offAddInServiceAction.action === CONSTANTS.SUBSCRIBE_SHEET_CHANGE
                })
                if (!tempRegisterSheetChangeAction)
                    registerAction(CONSTANTS.SUBSCRIBE_SHEET_CHANGE, [selectedActiveExcelFile])
            });
            clearSelectedActiveExcelFiles()
        } else {
            alert('Please select at least 1 file!')
        }
    }

    return (
        <div id='ExcelTester'>
            <ActiveExcelFileList />
            <button onClick={getCellDataOnClick}>Get Cells Data</button>
            <button onClick={setCellDataOnClick}>Set Cells Data</button>
            <button onClick={saveExcelWorkbook}>Save Workbook</button>
            <button onClick={subSheetChange}>Subscribe Sheet Change</button>

            <br /><br />

            <PreviousExcelFileList />
            <button onClick={spawnExcelFile}>Spawn File</button> <br />

            <br /><br />

            <textarea id='resultTextarea' value={resultTextArea} readOnly></textarea>

            <GetExcelCellsModal />
            <SetExcelCellsModal />
        </div>
    );
};

const mapStateToProps = (state: any, ownProps: any) => {
    const { officeAddinServiceActionsReducer, excelFilesReducer } = state
    return {
        offAddInServiceActions: officeAddinServiceActionsReducer.offAddInServiceActions,
        selectedActiveExcelFiles: excelFilesReducer.selectedActiveExcelFiles,
        selectedPreviousExcelFiles: excelFilesReducer.selectedPreviousExcelFiles,
        sheetChangeEvent: excelFilesReducer.sheetChangeEvent
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {
        clearSelectedPreviousExcelFiles: () => dispatch(setSelectedPreviousExcelFiles([])),
        clearSelectedActiveExcelFiles: () => dispatch(setSelectedActiveExcelFiles([])),
        setGetExecelCellsModalDisplay: (display: String) => dispatch(setGetExcelCellDataActionModalDisplay(display)),
        setSetExecelCellsModalDisplay: (display: String) => dispatch(setSetExcelCellDataActionModalDisplay(display)),
        registerAction: (action: string, excelFiles: Array<ExcelFile>) => dispatch(registerActionThunk(action, excelFiles)),
        saveWorkbook: (actionId: string, excelFile: ExcelFile) => dispatch(saveExcelWorkbookThunk(actionId, excelFile)),
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ExcelTester);