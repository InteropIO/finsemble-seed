import * as React from "react";
import { useState, useEffect } from "react";
import { connect } from "react-redux";
import { AnyAction } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { setExcelCellDataThunk, registerActionThunk, setSelectedActiveExcelFiles, setSetExcelCellDataActionModalDisplay } from "../redux/actions/actions";
import ExcelFile from "../types/ExcelFile";
import { ExcelAction } from "../types/types";
import * as CONSTANTS from '../redux/actions/actionTypes';



const SetExcelCellsModal = (props: any) => {
    let { selectedActiveExcelFiles, clearSelectedActiveExcelFiles } = props;
    let { offAddInServiceActions, setExcelCellData, registerAction } = props;
    let { modalDisplay, setSetExecelCellsModalDisplay } = props

    let [setExcelCellDataActions, setSetExcelCellDatActions] = useState<Array<ExcelAction>>([])
    let [startCell, setStartCell] = useState("A1")
    let [endCell, setEndCell] = useState("C3")
    let [sheetName, setSheetName] = useState("Sheet1")
    let [cellData, setCellData] = useState([['A1', 'B1', 'C1'], ['A2', 'B2', 'C2'], ['A3', 'B3', 'C3']])

    useEffect(() => {
        if (modalDisplay == 'block') {
            if (setExcelCellDataActions.length > 0) {
                // Check if there are any saveworkbook actions for each selected file
                let newSetCellDataActions = false
                let tempSetCellDataActions: Array<ExcelAction> = []
                selectedActiveExcelFiles.forEach((selectedActiveExcelFile: ExcelFile) => {
                    let tempSetCellDataAction = offAddInServiceActions.find((offAddInServiceAction: ExcelAction) => {
                        return offAddInServiceAction.file?.fileName === selectedActiveExcelFile.fileName && offAddInServiceAction.action === CONSTANTS.SET_EXCEL_CELL_DATA
                    })
                    // If there are no actions, register one 
                    if (!tempSetCellDataAction){
                        registerAction(CONSTANTS.SET_EXCEL_CELL_DATA, [selectedActiveExcelFile])
                        newSetCellDataActions = true
                    } else {
                        tempSetCellDataAction.file = selectedActiveExcelFile
                        tempSetCellDataActions.push(tempSetCellDataAction)
                    }
                });
                if(!newSetCellDataActions){
                    setSetExcelCellDatActions(tempSetCellDataActions)
                }
            } else {
                // Register action
                registerAction(CONSTANTS.SET_EXCEL_CELL_DATA, selectedActiveExcelFiles)
            }  
        }
    }, [modalDisplay]);

    useEffect(() => {
        if (selectedActiveExcelFiles) {
            let tempSetExcelCellDataActions: Array<ExcelAction> = []
            offAddInServiceActions.find((offAddInServiceAction: ExcelAction) => {
                let tempFile = selectedActiveExcelFiles.find((excelFile: ExcelFile) => {
                    return excelFile.fileName === offAddInServiceAction.file?.fileName
                })
                if (offAddInServiceAction.action === CONSTANTS.SET_EXCEL_CELL_DATA && tempFile)
                    tempSetExcelCellDataActions.push(offAddInServiceAction)
                return false
            })

            if (tempSetExcelCellDataActions.length > 0) {
                setSetExcelCellDatActions(tempSetExcelCellDataActions)
            }
        }

    }, [offAddInServiceActions]);

    const setExcelDataBtnOnClick = () => {
        console.log(setExcelCellDataActions)
        setExcelCellDataActions?.forEach((setExcelCellDataAction: ExcelAction) => {
            setExcelCellData(setExcelCellDataAction.id, setExcelCellDataAction.file, startCell, endCell, sheetName, cellData)
        })
    }

    const closeBtnOnClick = () => {
        setSetExecelCellsModalDisplay('none');
        clearSelectedActiveExcelFiles()
    }

    return (
        <div className="modal" style={{ display: modalDisplay }}>
            <div className="modal-content">
                <span className="close" onClick={closeBtnOnClick}>&times;</span>
                <h3>Set Excel Cell Data</h3>
                <div className="block">
                    <label className="modalLabel">Start Cell</label>
                    <input value={startCell} onChange={(e) => { setStartCell(e.target.value) }} />
                </div>
                <div className="block">
                    <label className="modalLabel">End Cell</label>
                    <input value={endCell} onChange={(e) => { setEndCell(e.target.value) }} />
                </div>
                <div className="block">
                    <label className="modalLabel">Sheet Name</label>
                    <input value={sheetName} onChange={(e) => { setSheetName(e.target.value) }} />
                    <button onClick={setExcelDataBtnOnClick}>Set</button>
                </div>
                <br />
                <textarea id='resultCellDataTextArea' value={JSON.stringify(cellData, null, "\t")} onChange={(e) => { setCellData(JSON.parse(e.target.value))}}></textarea>
            </div>
        </div >
    )
}

const mapStateToProps = (state: any, ownProps: any) => {
    const { officeAddinServiceActionsReducer, excelFilesReducer } = state
    return {
        modalDisplay: excelFilesReducer.setExcelCellDataModalDisplay,
        selectedActiveExcelFiles: excelFilesReducer.selectedActiveExcelFiles,
        excelCellData: excelFilesReducer.excelCellData,
        offAddInServiceActions: officeAddinServiceActionsReducer.offAddInServiceActions
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {
        setExcelCellData: (actionId: string, excelFile: ExcelFile, startCell: String, endCell: String, sheetName: String, values: Array<Array<String>>) => dispatch(setExcelCellDataThunk(actionId, excelFile, startCell, endCell, sheetName, values)),
        registerAction: (action: string, excelFiles: Array<ExcelFile>) => dispatch(registerActionThunk(action, excelFiles)),
        clearSelectedActiveExcelFiles: () => dispatch(setSelectedActiveExcelFiles([])),
        setSetExecelCellsModalDisplay: (display: String) => dispatch(setSetExcelCellDataActionModalDisplay(display)),
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SetExcelCellsModal);
