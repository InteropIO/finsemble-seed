import * as React from "react";
import { connect } from "react-redux";
import { AnyAction } from "redux";
import { ThunkDispatch } from "redux-thunk";

const CreateBookmark = (props: any) => {


    const createBookmark = () => {

    }

    return (
        <div className={'createBookmarkDiv'}>
            <label htmlFor="bookmarkName">Bookmark Name</label>
            <br/>
            <input id='bookmarkName' className='text' />
            <button id='createBookmarkBtn' onClick={createBookmark}>Create</button>
        </div>
    )
}

const mapStateToProps = (state: any, ownProps: any) => {
    const { officeAddinServiceActionsReducer, excelFilesReducer } = state
    return {

    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {

    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(CreateBookmark);
