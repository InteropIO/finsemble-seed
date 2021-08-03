import * as React from "react";
import { connect } from "react-redux";
import { AnyAction } from "redux";
import { ThunkDispatch } from "redux-thunk";

const EndCellInput = (props: any) => {
    const { endCell, setEndCell } = props;

    return (
        <div className={'cellInputDiv'}>
            <br />
            <label htmlFor="startCellInput">End Cell</label>
            <input id='startCellInput' className={'cellInput'} value={endCell} onChange={(e) => { setEndCell(e.target.value) }} />
        </div>
    )
}

const mapStateToProps = (state: any, ownProps: any) => {
    const { excelFilesReducer } = state
    return {
        endCell: excelFilesReducer.endCell
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(EndCellInput);
