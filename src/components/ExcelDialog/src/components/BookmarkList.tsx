import * as React from "react";
import { useEffect, useState } from "react";
import Select from "react-select";
import makeAnimated from 'react-select/animated';
import { connect } from "react-redux";
import { AnyAction } from "redux";
import { ThunkDispatch } from "redux-thunk"
import { getPreviousExcelFilesThunk, setSelectedBookmark, setSelectedPreviousExcelFiles } from "../redux/actions/actions";
import Bookmark from "../../../../services/OfficeAddin/types/Bookmark";

const BookmarkList = (props: any) => {
    const animatedComponents = makeAnimated();
    const customStyles = {
        option: (provided: any, state: any) => ({
            ...provided,
            color: 'black'
        })
    }

    const { selectedBookmark, setSelectedBookmark } = props;

    const [bookmarkList, setBookmarkList] = useState(Array<Bookmark>())

    useEffect(() => {
        FSBL.Clients.DistributedStoreClient.getStore({ store: "excelBookmarkStore" }, (err: any, store: any) => {
            store.getValue({ field: 'bookmarks' }, (err: any, data: Array<Bookmark>) => { setBookmarkList(data) });
            store.addListener({ field: 'bookmarks' }, (err: any, data: any) => { setBookmarkList(data.value) });
        })
    }, [])

    return (
        <div className="bookmarkListDiv">
            <label htmlFor="excelFileList">Bookmark List</label>
            <Select
                styles={customStyles}
                closeMenuOnSelect={true}
                components={animatedComponents}
                getOptionLabel={({ name }) => name}
                getOptionValue={({ name }) => name}
                options={bookmarkList}
                onChange={setSelectedBookmark}
                value={selectedBookmark}
            />
        </div>
    )
}

const mapStateToProps = (state: any, ownProps: any) => {
    const { officeAddinServiceActionsReducer, excelFilesReducer } = state
    return {
        selectedBookmark: excelFilesReducer.selectedBookmark,
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {
        setSelectedBookmark: (selectedBookmark: Bookmark) => dispatch(setSelectedBookmark(selectedBookmark)),
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(BookmarkList);
