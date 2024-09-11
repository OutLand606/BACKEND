export type BeforeFn = (context: BeforeType) => void;
export interface BeforeType {
  args: any[]; //là tất cả các tham số được truyền vào hàm chính thực thi
}
export function Before(...input: BeforeFn[]) {
  return (
    _target: any,
    _key: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      for (const iterator of input) {
        await iterator.call(this, { args });
      }
      return originalMethod.apply(this, args);
    };
    return descriptor;
  };
}