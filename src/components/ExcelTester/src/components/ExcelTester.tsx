import * as React from "react";
import { connect } from "react-redux";
import { AnyAction } from "redux";
import { ThunkDispatch } from "redux-thunk"

import ExcelFileList from "./ExcelFileList";
import ExcelFile from "../types/ExcelFile";
import { useState } from "react";
import GetExcelCellsModal from "./GetExcelCellsModal";



const ExcelTester = (props: any) => {
    const { getExcelFileList, offAddInServiceActions } = props;
    let [selectedFiles, setSelectedFiless] = useState<Array<ExcelFile>>()
    let setSelectedFiles = (selectedFilesParam: Array<ExcelFile>) => {
        setSelectedFiless(selectedFilesParam);
    }
    let [getExecelCellsModalVisible, setGetExecelCellsModalVisible] = useState("none")

    window.onclick = (event: any) => {
        if (event.target.className == 'modal') {
            setGetExecelCellsModalVisible("none");

        }
    }

    const getCellDataOnClick = () => {
        if (selectedFiles)
            if (selectedFiles.length > 0) {
                setGetExecelCellsModalVisible(getExecelCellsModalVisible == 'none' ? 'block' : 'none')
            } else {
                alert('Please select at least 1 file!')
            }
        else {
            alert('Please select at least 1 file!')
        }
    }

    return (
        <div>
            <ExcelFileList setSelectedFiles={setSelectedFiles} />
            <button onClick={getCellDataOnClick}>Get Excel Cells Data</button>





            <GetExcelCellsModal selectedFiles={selectedFiles} modalVisible={getExecelCellsModalVisible} />
        </div>
    );
};

const mapStateToProps = (state: any, ownProps: any) => {
    const { officeAddinServiceActionsReducer } = state
    return { offAddInServiceActions: officeAddinServiceActionsReducer.offAddInServiceActions }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    //dispatch(getExcelFileListThunk(''))
    return {

    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ExcelTester);