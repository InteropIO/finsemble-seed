export declare class ObjectPool {
    objects: any;
    poolName: string;
    constructor(name: string, dependencies: {
        Logger: any;
    });
    get(name: any, throwError?: boolean): any;
    remove(name: any): void;
    add(name: any, obj: any): void;
    iterator(): IterableIterator<any>;
    getAll(): any;
}
