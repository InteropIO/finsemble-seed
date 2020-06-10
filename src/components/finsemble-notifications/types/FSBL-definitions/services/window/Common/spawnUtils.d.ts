import { WindowDescriptor } from "./types";
declare const _default: {
    getSecurityPolicy(descriptor: WindowDescriptor, finsembleConfig: any): any;
    /**
     * Returns a permissions object with information expected in the e2o layer.
     * This will go grab the set of permissions defined by the security policy.
     * Afterwards, it will apply any specific permissions that the component has on it.
     * It will not allow _more permissive_ permissions to be set.
     *
     * If the policy says System.exist is not allowed, but the component says that it is,
     * this function will return a set of permissions where System.exit is false.
     * @param descriptor
     */
    getPermissions(descriptor: WindowDescriptor, finsembleConfig: any): {
        System: {};
        Window: {};
        Application: {};
    };
};
export default _default;
