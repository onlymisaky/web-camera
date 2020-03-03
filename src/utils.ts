export function isPromise(val: any) {
  return (
    val !== undefined && val !== null
    && typeof val.then === 'function'
    && typeof val.catch === 'function'
  );
}

export function cameraAuth(methodName: string) {
  return function (
    target: Object,
    propertyKey: PropertyKey,
    descriptor: TypedPropertyDescriptor<any>,
  ): TypedPropertyDescriptor<any> | void {
    if (window.navigator.mediaDevices && (window.navigator.mediaDevices as { [key: string]: any })[methodName]) {
      return {
        ...descriptor,
        value(...args: any[]) {
          return descriptor.value.apply(this, args)
            .catch((err: any) => {
              (<{ status: string }>this).status = 'failure';
              return Promise.reject(err);
            });
        },
      };
    }
    return {
      ...descriptor,
      value() {
        (<{ status: string }>this).status = 'failure';
        return Promise.reject('当前浏览器不支持拍照！');
      },
    };
  };
}

export function setStatus(
  status: 'init' | 'failure' | 'ready' | 'busy' | 'destroyed',
  moment: 'before' | 'after' = 'after',
) {
  return function (
    target: Object,
    propertyKey: PropertyKey,
    descriptor: TypedPropertyDescriptor<any>,
  ): TypedPropertyDescriptor<any> | void {
    const method = descriptor.value;
    descriptor.value = function (...args: any) {
      if (moment === 'after') {
        const result: Promise<any> | any = method.apply(this, args);
        if (isPromise(result)) {
          return result.then((res: any) => {
            (this as { status: string }).status = status;
            return res;
          }).catch((err: any) => {
            (this as { status: string }).status = 'failure';
            return Promise.reject(err);
          });
        }
        (this as { status: string }).status = status;
        return result;
      }
      (this as { status: string }).status = status;
      return method.apply(this, args);
    };
  };
}
