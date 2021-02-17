import * as React from "react";
import { connect } from "react-redux";
import { AnyAction } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { setStartCell } from "../redux/actions/actions";

const StartCellInput = (props: any) => {
    const { startCell, setStartCell } = props

    return (
        <div className={'cellInputDiv'}>
            <br />
            <label htmlFor="startCellInput">Start Cell</label>
            <input id='startCellInput' className={'cellInput'} value={startCell} onChange={(e) => { setStartCell(e.target.value) }} />
        </div>
    )
}

const mapStateToProps = (state: any, ownProps: any) => {
    const { officeAddinServiceActionsReducer, excelFilesReducer } = state
    return {
        startCell: excelFilesReducer.startCell
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {
        setStartCell: (startCell: string) => dispatch(setStartCell(startCell)),
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(StartCellInput);
