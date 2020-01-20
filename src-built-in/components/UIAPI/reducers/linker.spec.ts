/**
 * Mody: Prior this, there was no tests folder and
 * there wasn't any configuration for mocha or any other
 * testing framework, placing spec files in the same
 * directory for now (personal pref) I can move them
 * to another folder later on if requested to do so.
 */
import reducer, { initialState } from './linker';
import * as actions from '../actions/linkerActions';
import { assert } from 'chai';

/**
 * Creates a dummy channel object for testing purposes
 */
const channel = (id, active, color) => {
    return {
        name: color,
        color,
        active,
        id
    }
}

describe('Linker reducer', () => {
    it('Should return the default initial state', () => {
        const action = {
            type: 'some invalid type',
            payload: {}
        };
        const output = reducer(undefined, action);
        assert.deepEqual(output, initialState);
    });
    /* Mody: The following tests are pending because
    there are many internal functions that aren't
    referencable which makes it difficult to stub/spy.
    */
    it('Should handle init');
    it('Should handle init success');
    it('Should handle linker cleanup');
    it('Should handle toggle channel request');
    it('Should handle update active channels', () => {
        const state = {
            ...initialState,
            channels: {
               20: channel(20, false, 'green'),
               30: channel(30, false, 'red'),
               40: channel(40, false, 'blue')
            }
        };
        const nextState = {
            ...state,
            channels: {
                20: channel(20, false, 'green'),
                // We expect channels 30 and 40 to be active
                30: channel(30, true, 'red'),
                40: channel(40, true, 'blue')
             }
        }
        const updateAction = actions.updateActiveChannels({
            channels: [
                channel(30, true, 'red'),
                channel(40, true, 'blue')
            ],
            windowIdentifier: {}
        });
        const output = reducer(state, updateAction);
        assert.deepEqual(output, nextState);
    });
    it('Should handle toggle channel success', () => {
        const id = 20;
        const state = {
            ...initialState,
            channels: {
                [id]: channel(id, true, 'green')
            }
        };
        const nextState = {
            ...state,
            channels: {
                ...state.channels,
                [id]: channel(id, false, 'green')
            }
        };
        const output = reducer(state, actions.toggleSuccess(id));
        assert.deepEqual(output, nextState);
    });
    it('Should handle toggle channel failure', () => {
        const nextState = {
            ...initialState,
            processingRequest: false
        }
        const output = reducer(initialState, actions.toggleFailure());
        assert.deepEqual(output, nextState);
    });
});
