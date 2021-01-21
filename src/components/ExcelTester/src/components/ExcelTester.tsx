import * as React from "react";
import { connect } from "react-redux";
import { AnyAction } from "redux";
import { ThunkDispatch } from "redux-thunk"

import ActiveExcelFileList from "./ActiveExcelFileList";
import ExcelFile from "../types/ExcelFile";
import { useEffect, useState, useRef } from "react";
import GetExcelCellsModal from "./GetExcelCellsModal";
import PreviousExcelFileList from "./PreviousExcelFileList";
import { setGetExcelCellDataActionModalDisplay, setSelectedActiveExcelFiles, setSelectedPreviousExcelFiles } from "../redux/actions/actions";


const ExcelTester = (props: any) => {
    const { offAddInServiceActions } = props;
    const { selectedActiveExcelFiles, clearSelectedActiveExcelFiles } = props;
    const { selectedPreviousExcelFiles, clearSelectedPreviousExcelFiles } = props;
    const { setGetExecelCellsModalDisplay } = props

    useEffect(() => {
        window.onclick = (event: any) => {
            if (event.target.className == 'modal') {
                setGetExecelCellsModalDisplay('none')

                clearSelectedActiveExcelFiles()
            }
        }
    }, [])

    const getCellDataOnClick = () => {
        if (selectedActiveExcelFiles.length > 0) {
            setGetExecelCellsModalDisplay('block')
        } else {
            alert('Please select at least 1 file!')
        }
    }

    const spawnExcelFile = () => {
        if (selectedPreviousExcelFiles.length > 0) {
            selectedPreviousExcelFiles.forEach((selectedPreviousFile: ExcelFile) => {
                FSBL.Clients.LauncherClient.spawn('Excel', { arguments: `${selectedPreviousFile.filePath} /lfinsemble-excel-test` });
            })
            clearSelectedPreviousExcelFiles()
        } else {
            alert('Please select at least 1 file!')
        }
    }

    return (
        <div>
            <ActiveExcelFileList />
            <button onClick={getCellDataOnClick}>Get Excel Cells Data</button>

            <br /><br />

            <PreviousExcelFileList />
            <button onClick={spawnExcelFile}>Spawn Excel File</button> <br />

            <br /><br />

            <GetExcelCellsModal />
        </div>
    );
};

const mapStateToProps = (state: any, ownProps: any) => {
    const { officeAddinServiceActionsReducer, excelFilesReducer } = state
    return {
        offAddInServiceActions: officeAddinServiceActionsReducer.offAddInServiceActions,
        selectedActiveExcelFiles: excelFilesReducer.selectedActiveExcelFiles,
        selectedPreviousExcelFiles: excelFilesReducer.selectedPreviousExcelFiles
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {
        clearSelectedPreviousExcelFiles: () => dispatch(setSelectedPreviousExcelFiles([])),
        clearSelectedActiveExcelFiles: () => dispatch(setSelectedActiveExcelFiles([])),
        setGetExecelCellsModalDisplay: (display: String) => dispatch(setGetExcelCellDataActionModalDisplay(display)),
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ExcelTester);