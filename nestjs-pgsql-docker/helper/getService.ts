import { HttpException } from "@nestjs/common";
import { app } from "../src/main";

const getService = async <T extends new (...args: any[]) => any>(
  typeService: T,
): Promise<InstanceType<T>> => {
  const service = (typeService as any).name.charAt(0).toLowerCase() + (typeService as any).name.slice(1);
  const that = this as unknown
  if (!that)
    throw HttpException;
  if (!that[service]) {
    that[service] = (await app).get((typeService as any));
  }
  if (
    process.env.NODE_ENV !== 'production' &&
    that[service] !== (await app).get((typeService as any))
  ) {
    throw new Error(
      `Service ${service} đã được định nghĩa type ${that[service].constructor.name} không thể định nghĩa lại bằng ${typeService} `,
    );
  }
  return that[service];
}
export default getService