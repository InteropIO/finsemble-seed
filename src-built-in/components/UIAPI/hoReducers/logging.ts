import { Linker, LinkerAction } from '../types';

declare const FSBL: any;

const withLogging = (component: string, reducer: Function) => (state: Linker, action: LinkerAction) => {
    FSBL.Clients.Logger.system.debug(`${component} -> ${action.type}. current state: ${JSON.stringify(state, null, 4)}`);
    return reducer(state, action);
};

export default withLogging;
