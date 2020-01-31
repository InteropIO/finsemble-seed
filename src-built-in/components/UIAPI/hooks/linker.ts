import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from "react";

import { RootState, Linker } from '../types';
import * as actions from '../actions/linkerActions';

// Encapsulate the linker initialization and Redux dispatch functions inside the hook
export const useLinker = () => {
    const dispatch = useDispatch();
    const linker: Linker = useSelector((state: RootState) => state.linker);

    useEffect(() => {
		dispatch(actions.init());
        return () => {
            dispatch(actions.cleanUp());
        }
	}, []);

    const toggleChannel = (channelId: number) => {
        dispatch(actions.toggleChannel(channelId));
    }

    return { linker, toggleChannel };
};