import { useDispatch } from 'react-redux';
import { useEffect } from "react";
import * as actions from '../actions/linkerActions';

// Encapsulate the linker initialization and Redux dispatch functions inside the hook
export const useLinker = () => {
    const dispatch = useDispatch();

    useEffect(() => {
		dispatch(actions.init());
        return () => {
            dispatch(actions.cleanUp());
        }
	}, []);

    const toggleChannel = (channelId: number) => {
        dispatch(actions.toggleChannel(channelId));
    }

    return [toggleChannel];
};