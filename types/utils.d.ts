export declare function isPromise(val: any): boolean;
export declare function cameraAuth(methodName: string): (target: Object, propertyKey: string | number | symbol, descriptor: TypedPropertyDescriptor<any>) => void | TypedPropertyDescriptor<any>;
export declare function setStatus(status: 'init' | 'failure' | 'ready' | 'busy' | 'destroyed', moment?: 'before' | 'after'): (target: Object, propertyKey: string | number | symbol, descriptor: TypedPropertyDescriptor<any>) => void | TypedPropertyDescriptor<any>;
