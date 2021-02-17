import * as React from "react";
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { AnyAction } from "redux";
import { ThunkDispatch } from "redux-thunk"
import { copyToExcel, getWorksheetList, registerActionThunk, setSelectedActiveExcelFile, setSelectedClipboardData, setSelectedPreviousExcelFiles } from "../redux/actions/actions";
import ExcelFile from "../types/ExcelFile";

import ActiveExcelFileList from "./ActiveExcelFileList";
import PreviousExcelFileList from "./PreviousExcelFileList";
import BookmarkList from "./BookmarkList"
import StartCellInput from "./StartCellInput";
import EndCellInput from "./EndCellInput";
import CreateBookmark from "./CreateBookmark";
import OpenWorksheetList from "./OpenWorksheetList";
import TargetWorksheetList from "./TargetWorksheetList";
import * as CONSTANTS from "../redux/actions/actionTypes";
import { ExcelAction } from "../../../ExcelTester/src/types/types";


const CopyToExcelDialog = (props: any) => {
    const { selectedActiveExcelFile } = props;
    const { selectedPreviousExcelFiles, clearSelectedPreviousExcelFiles } = props;
    const { clipboardData, setSelectedClipboardData } = props
    const { copyToExcel } = props
    const { targetWorksheet, startCell, endCell, openWorksheet } = props
    const { offAddInServiceActions } = props;
    const { registerCopyToExcel } = props;

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

    useEffect(() => {
        let tempCopyToExcelActions = offAddInServiceActions.filter((offAddInServiceAction: ExcelAction) => {
            return offAddInServiceAction.action === CONSTANTS.COPY_TO_EXCEL && offAddInServiceAction.file?.fileName === selectedActiveExcelFile.fileName
        })
        if (tempCopyToExcelActions.length > 0) {
            tempCopyToExcelActions.forEach((tempCopyToExcelAction: ExcelAction) => {
                copyToExcel(tempCopyToExcelAction.id, selectedActiveExcelFile, targetWorksheet, startCell, endCell, openWorksheet, clipboardData)
            })
        }

    }, [offAddInServiceActions])

    const loadBookmark = () => {

    }

    const copyToExceOnClickl = () => {
        // Need to implement to check logic
        let tempCopyToExcelActions = offAddInServiceActions.filter((offAddInServiceAction: ExcelAction) => {
            return offAddInServiceAction.action === CONSTANTS.COPY_TO_EXCEL && offAddInServiceAction.file?.fileName === selectedActiveExcelFile.fileName
        })
        if (tempCopyToExcelActions.length > 0) {
            tempCopyToExcelActions.forEach((tempCopyToExcelAction: ExcelAction) => {
                copyToExcel(tempCopyToExcelAction.id, selectedActiveExcelFile, targetWorksheet, startCell, endCell, openWorksheet, clipboardData)
            })
        } else {
            registerCopyToExcel([selectedActiveExcelFile])
        }
    }

    return (
        <div id='CopyToExcelDialog'>
            <textarea id='dummyClipboardDataTextArea' value={JSON.stringify(clipboardData, null, "\t")} onChange={(e) => { setSelectedClipboardData(JSON.parse(e.target.value)) }}></textarea>
            <br /><br />

            <div>
                <PreviousExcelFileList />
                <button onClick={spawnExcelFile}>Spawn</button>
            </div>

            <div>
                <BookmarkList />
                <button onClick={loadBookmark}>Load</button>
            </div>
            <br />
            <div>
                <ActiveExcelFileList />
                <TargetWorksheetList />
                <StartCellInput />
                <EndCellInput />
                <OpenWorksheetList />
                <button onClick={copyToExceOnClickl}>Copy</button>
            </div>

            <CreateBookmark />

        </div>
    );
};

const mapStateToProps = (state: any, ownProps: any) => {
    const { officeAddinServiceActionsReducer, excelFilesReducer } = state
    return {
        offAddInServiceActions: officeAddinServiceActionsReducer.offAddInServiceActions,
        selectedActiveExcelFile: excelFilesReducer.selectedActiveExcelFile,
        selectedPreviousExcelFiles: excelFilesReducer.selectedPreviousExcelFiles,
        clipboardData: excelFilesReducer.selectedClipboardData,
        targetWorksheet: excelFilesReducer.targetWorksheet,
        openWorksheet: excelFilesReducer.openWorksheet,
        startCell: excelFilesReducer.startCell,
        endCell: excelFilesReducer.endCell
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {
        registerCopyToExcel: (excelFiles: Array<ExcelFile>) => dispatch(registerActionThunk(CONSTANTS.COPY_TO_EXCEL, excelFiles)),
        clearSelectedPreviousExcelFiles: () => dispatch(setSelectedPreviousExcelFiles([])),
        clearSelectedActiveExcelFiles: () => dispatch(setSelectedActiveExcelFile(null)),
        setSelectedClipboardData: (clipboardData: {}) => dispatch(setSelectedClipboardData(clipboardData)),
        copyToExcel: (actionId: string, targetExcelFile: ExcelFile, targeWorksheet: string, startCell: string, endCell: string, openWorksheet: string, data: []) => { dispatch(copyToExcel(actionId, targetExcelFile, targeWorksheet, startCell, endCell, openWorksheet, data)) }
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(CopyToExcelDialog);