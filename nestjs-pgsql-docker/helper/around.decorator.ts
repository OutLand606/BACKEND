type AroundFn = (context: AroundType) => Promise<any>;
interface Params {
  [key: string]: {};
}
export type AroundType = {
  proceed: (...args: any[]) => Promise<any>; //hàm chạy chính được gọi.
  args: any[]; //là tất cả các tham số được truyền vào hàm chính thực thi.
}
export function Around(aroundFn: AroundFn, ) {
  return (
    _target: any,
    _key?: string | symbol,
    descriptor?: TypedPropertyDescriptor<any>,
  ) => {
    if (descriptor) {
      const originalMethod = descriptor.value;
      descriptor.value = async function (...args: any[]) {
        return await aroundFn.call(this, {
          proceed: originalMethod.bind(this),
          args,
        });
      };
      return descriptor;
    }
  };
}