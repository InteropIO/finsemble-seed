/**
 * Mody: Prior this, there was no tests folder and
 * there wasn't any configuration for mocha or any other
 * testing framework, placing spec files in the same
 * directory for now (personal pref) I can move them
 * to another folder later on if requested to do so.
 */
import { linker as reducer , initialState } from './linker';
import { linkChannel, initializeLinker, cleanUp, fitDOM } from '../effects/linker';
import { toggleSuccess, toggleFailure, initSuccess } from '../actions/linkerActions';
import { actions } from '../types'
import { assert } from 'chai';
import 'mocha';

/**
 * Creates a dummy channel object for testing purposes
 */
const channel = (id: string, active: boolean, color: string) => {
    return {
        name: color,
        color,
        active,
        id,
        border: color
    }
}

const initialChannels = () => {
    return [0, 1, 2, 3, 4, 5].map(n => {
        return channel(`${n}`, false, 'color');
    });
};

describe('Linker reducer', () => {
    // Toggle channel request set the "prosessingRequest" property on the linker state to "true"
    it('Should handle toggle channel request', () => {
    });

    it('Should handle update active channels', () => {
    });
});
