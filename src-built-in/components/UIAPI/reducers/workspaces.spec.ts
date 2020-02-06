import { assert } from 'chai';
import 'mocha';
import { workspaces as reducer, initialState } from './workspaces';
import * as Actions from '../actions/workspaceActions';

describe('Linker reducer', () => {
	it('Should return the default initial state', () => {
		const action = {
			type: 'some invalid type',
			payload: {}
		};
		const output = reducer(undefined, action);
		assert.deepEqual(output, initialState);
	});

	it('Should set the Active Workspace Name', () => {
		const expectedState = {
			...initialState,
			activeWorkspace: {
				name: 'Wonky'
			}
		}
		const output = reducer(initialState, Actions.setActiveWorkspaceName('Wonky'));
		assert.deepEqual(output, expectedState);
	})
});