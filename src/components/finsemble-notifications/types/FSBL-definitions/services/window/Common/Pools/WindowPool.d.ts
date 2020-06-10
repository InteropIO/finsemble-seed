import { ObjectPool } from "./ObjectPool";
declare class WindowPool extends ObjectPool {
    iterator(): IterableIterator<any>;
}
export { WindowPool };
