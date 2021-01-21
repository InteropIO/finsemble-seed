import * as React from "react";
import { useState, useEffect } from "react";
import { connect } from "react-redux";
import { AnyAction } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { getExcelCellDataThunk, registerActionThunk, setGetExcelCellDataActionModalDisplay, setSelectedActiveExcelFiles } from "../redux/actions/actions";
import ExcelFile from "../types/ExcelFile";
import { ExcelAction } from "../types/types";
import { GET_EXCEL_CELL_DATA } from './../redux/actions/actionTypes';



const GetExcelCellsModal = (props: any) => {
    let { selectedActiveExcelFiles, clearSelectedActiveExcelFiles } = props;
    let { offAddInServiceActions, getExcelCellData, registerAction, excelCellData } = props;
    let { modalDisplay, setGetExecelCellsModalDisplay } = props

    let [getExcelCellDataActions, setGetExcelCellDatActions] = useState<Array<ExcelAction>>([])
    let [startCell, setStartCell] = useState("A1")
    let [endCell, setEndCell] = useState("B2")
    let [sheetName, setSheetName] = useState("Sheet1")
    let [resultCellData, setResultCellData] = useState("")

    useEffect(() => {
        if (modalDisplay == 'block') {
            setResultCellData('')
            if (getExcelCellDataActions.length > 0) {
                let tempGetExcelCellDataActions: Array<ExcelAction> = []
                offAddInServiceActions.find((offAddInServiceAction: ExcelAction) => {
                    let tempFile = selectedActiveExcelFiles.find((excelFile: ExcelFile) => {
                        return excelFile.fileName === offAddInServiceAction.file?.fileName
                    })
                    if (offAddInServiceAction.action === GET_EXCEL_CELL_DATA && tempFile)
                        tempGetExcelCellDataActions.push(offAddInServiceAction)
                    return false
                })

                if (tempGetExcelCellDataActions.length > 0) {
                    setGetExcelCellDatActions(tempGetExcelCellDataActions)
                }
            } else {
                // Register action
                registerAction(GET_EXCEL_CELL_DATA, selectedActiveExcelFiles)
            }
        }
    }, [modalDisplay]);

    useEffect(() => {
        if (selectedActiveExcelFiles) {
            let tempGetExcelCellDataActions: Array<ExcelAction> = []
            offAddInServiceActions.find((offAddInServiceAction: ExcelAction) => {
                let tempFile = selectedActiveExcelFiles.find((excelFile: ExcelFile) => {
                    return excelFile.fileName === offAddInServiceAction.file?.fileName
                })
                if (offAddInServiceAction.action === GET_EXCEL_CELL_DATA && tempFile)
                    tempGetExcelCellDataActions.push(offAddInServiceAction)
                return false
            })

            if (tempGetExcelCellDataActions.length > 0) {
                setGetExcelCellDatActions(tempGetExcelCellDataActions)
            }
        }

    }, [offAddInServiceActions]);

    useEffect(() => {
        setResultCellData(resultCellData + JSON.stringify(excelCellData, null, "\t") + '\n')
    }, [excelCellData])

    const getExcelDataBtnOnClick = () => {
        setResultCellData('')
        getExcelCellDataActions?.forEach((getExcelCellDataAction: ExcelAction) => {
            getExcelCellData(getExcelCellDataAction.id, getExcelCellDataAction.file, startCell, endCell, sheetName)
        })
    }

    const closeBtnOnClick = () => {
        setGetExecelCellsModalDisplay('none');
        clearSelectedActiveExcelFiles()
    }

    return (
        <div className="modal" style={{ display: modalDisplay }}>
            <div className="modal-content">
                <span className="close" onClick={closeBtnOnClick}>&times;</span>
                <h3>Get Excel Cell Data</h3>
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
                    <button onClick={getExcelDataBtnOnClick}>Get</button>
                </div>
                <br />
                <textarea id='resultCellDataTextArea' value={resultCellData} onChange={(e) => { }} readOnly></textarea>
            </div>
        </div >
    )
}

const mapStateToProps = (state: any, ownProps: any) => {
    const { officeAddinServiceActionsReducer, excelFilesReducer } = state
    return {
        modalDisplay: excelFilesReducer.getExcelCellDataModalDisplay,
        selectedActiveExcelFiles: excelFilesReducer.selectedActiveExcelFiles,
        excelCellData: excelFilesReducer.excelCellData,
        offAddInServiceActions: officeAddinServiceActionsReducer.offAddInServiceActions
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {
        getExcelCellData: (actionId: string, excelFile: ExcelFile, startCell: String, endCell: String, sheetName: String) => dispatch(getExcelCellDataThunk(actionId, excelFile, startCell, endCell, sheetName)),
        registerAction: (action: string, excelFiles: Array<ExcelFile>) => dispatch(registerActionThunk(action, excelFiles)),
        clearSelectedActiveExcelFiles: () => dispatch(setSelectedActiveExcelFiles([])),
        setGetExecelCellsModalDisplay: (display: String) => dispatch(setGetExcelCellDataActionModalDisplay(display)),

    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(GetExcelCellsModal);
