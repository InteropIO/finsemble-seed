import * as React from "react";
import { connect } from "react-redux";
import { AnyAction } from "redux";
import { ThunkDispatch } from "redux-thunk"

import ExcelFileList from "./ExcelFileList";
import { getExcelFileListThunk } from "./../redux/actions/actions";
import { GET_EXCEL_FILE_LIST } from './../redux/actions/actionTypes';



const ExcelTester = (props: any) => {
    const { getExcelFileList,offAddInServiceActions } = props;

    return (
        <div>
            <ExcelFileList />
        </div>
    );
};

const mapStateToProps = (state:any, ownProps:any) => {
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