import { ObjectPool } from "./ObjectPool";
import { WindowPool } from "./WindowPool";
declare const GroupPoolSingleton: ObjectPool;
declare const MonitorPoolSingleton: ObjectPool;
declare const WindowPoolSingleton: ObjectPool;
declare const DockingPoolSingleton: WindowPool;
export { GroupPoolSingleton, WindowPoolSingleton, MonitorPoolSingleton, DockingPoolSingleton };
