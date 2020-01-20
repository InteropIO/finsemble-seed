import * as actions from './linkerActions';
import {
    TOGGLE_CHANNEL_REQUEST,
    TOGGLE_CHANNEL_SUCCESS,
    TOGGLE_CHANNEL_FAILURE,
    LINKER_INIT,
    LINKER_INIT_SUCCESS,
    LINKER_CLEANUP,
    UPDATE_ACTIVE_CHANNELS
} from "../actionTypes";
import { assert } from 'chai';
/**
 * Make sure that the right action creator is called 
 * and the right action returned.
 */
describe('linker actions', () => {
    it('should create a toggle channel request action', () => {
        const action = {
            type: TOGGLE_CHANNEL_REQUEST,
            payload: {
                channelID: 1
            }
        };
        assert.deepEqual(actions.toggleChannel(1), action);
    });
    it('should create a toggle channel success action', () => {
        const action = {
            type: TOGGLE_CHANNEL_SUCCESS,
            payload: {
                channelID: 1
            }
        };
        assert.deepEqual(actions.toggleSuccess(1), action);
    });
    it('should create a toggle channel failure action', () => {
        const action = {
            type: TOGGLE_CHANNEL_FAILURE
        };
        assert.deepEqual(actions.toggleFailure(), action);
    });
    it('should create an init action', () => {
        const action = {
            type: LINKER_INIT,
        };
        assert.deepEqual(actions.init(), action);
    });
    it('should create an init success action', () => {
        const args = {};
        const action = {
            type: LINKER_INIT_SUCCESS,
            payload: {
                value: args
            }
        };
        assert.deepEqual(actions.initSuccess(args), action);
    });
    it('should create a linker cleanup action', () => {
        const action = {
            type: LINKER_CLEANUP,
        };
        assert.deepEqual(actions.cleanUp(), action);
    });
    it('should create update active channels action', () => {
        const args = {
            channels: {},
            windowIdentifier: {}
        };
        const action = {
            type: UPDATE_ACTIVE_CHANNELS,
            payload: {
                updatedActiveChannels: args.channels,
                updatedWindowIdentifier: args.windowIdentifier
            }
        };
        assert.deepEqual(actions.updateActiveChannels(args), action);
    });
});