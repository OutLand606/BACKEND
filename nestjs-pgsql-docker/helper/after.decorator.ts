export type AfterFn = (context: AfterType) => void;
export interface AfterType {
  args: any[]; //là tất cả các tham số được truyền vào hàm chính thực thi.
  response?: any //là kết quả trả về sau hi hàm chính được gọi.
}
export function After(...afterFn: AfterFn[]) {
  return (
    _target: any,
    _key: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const response = await originalMethod.apply(this, args);

      for (const iterator of afterFn) {
        await iterator.call(this, { args, response });
      }

      return response
    };

    return descriptor;
  };
}