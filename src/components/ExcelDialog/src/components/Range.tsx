import * as React from "react";
import { connect } from "react-redux";
import { AnyAction } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { setRange } from "../redux/actions/actions";

const Range = (props: any) => {
    const { range, setRange } = props

    return (
        <div className={'rangeInputDiv'}>
            <br />
            <label htmlFor="rangeInput">Range</label>
            <input id='rangeInput' className={'rangeInput'} value={range} onChange={(e) => { setRange(e.target.value) }} />
        </div>
    )
}

const mapStateToProps = (state: any, ownProps: any) => {
    const { excelFilesReducer } = state
    return {
        range: excelFilesReducer.range
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {
        setRange: (range: string) => dispatch(setRange(range)),
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Range);
