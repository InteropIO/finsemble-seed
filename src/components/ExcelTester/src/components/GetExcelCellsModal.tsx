import * as React from "react";
import { useState, useEffect } from "react";
import { connect } from "react-redux";
import { AnyAction } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { getExcelCellDataThunk } from "../redux/actions/actions";
import ExcelFile from "../types/ExcelFile";
import { action } from "../types/types";

const GET_EXCEL_CELL_DATA = 'GET_EXCEL_CELL_DATA';

const GetExcelCellsModal = (props: any) => {
    let { modalVisible, selectedFiles, offAddInServiceActions, getExcelCellData } = props
    let [localModalVisible, setLocalModalVisible] = useState(modalVisible)
    let [getExcelCellDataAction, setGetExcelCellDatAction] = useState()

    
    useEffect(() => {
        setLocalModalVisible(modalVisible)
        if (modalVisible == 'block') {
            console.log(offAddInServiceActions)
            console.log(getExcelCellDataAction)
            if (getExcelCellDataAction) {
                let tempGetExcelCellDataAction = offAddInServiceActions.find((offAddInServiceAction: action) => {
                    let tempFile = selectedFiles.find((excelFile: ExcelFile) => {
                        return excelFile.fileName === offAddInServiceAction.file?.fileName
                    })
                    return offAddInServiceAction.action === GET_EXCEL_CELL_DATA && tempFile
                })

                if (tempGetExcelCellDataAction) {
                    setGetExcelCellDatAction(tempGetExcelCellDataAction)
                }
            } else {
                // Register action
                getExcelCellData('', selectedFiles)
            }
        }
    }, [modalVisible]);

    useEffect(() => {
        if(selectedFiles){
            let tempGetExcelCellDataAction = offAddInServiceActions.find((offAddInServiceAction: action) => {
                let tempFile = selectedFiles.find((excelFile: ExcelFile) => {
                    return excelFile.fileName === offAddInServiceAction.file?.fileName
                })
                return offAddInServiceAction.action === GET_EXCEL_CELL_DATA && tempFile
            })
    
            if (tempGetExcelCellDataAction) {
                setGetExcelCellDatAction(tempGetExcelCellDataAction)
            }
            setGetExcelCellDatAction(tempGetExcelCellDataAction)
        }
        
    }, [offAddInServiceActions]);

    const getExcelDataBtnOnClick = () => {
        if(getExcelCellDataAction){
            getExcelCellData(getExcelCellDataAction.id, getExcelCellDataAction.file)
        }
    }

    return (
        <div className="modal" style={{ display: localModalVisible }}>
            <div className="modal-content">
                <span className="close" onClick={() => { setLocalModalVisible('none') }}>&times;</span>
                <h3>Get Excel Cell Data</h3>
                <input />
                <input />
                <button onClick={getExcelDataBtnOnClick}>Get</button>
            <textarea></textarea>
        </div>
        </div >
    )
}

const mapStateToProps = (state: any, ownProps: any) => {
    const { officeAddinServiceActionsReducer, excelFilesReducer } = state
    return {
        //excelFileList: excelFilesReducer.excelFileList,
        offAddInServiceActions: officeAddinServiceActionsReducer.offAddInServiceActions
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {
        getExcelCellData: (actionId: string, excelFiles: Array<ExcelFile>) => dispatch(getExcelCellDataThunk(actionId, excelFiles))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(GetExcelCellsModal);
