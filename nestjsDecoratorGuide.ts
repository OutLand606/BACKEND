/* Khai báo function type decorator After */
// export type AfterFn = (context: AfterType) => void;
// export interface AfterType {
//   args: any[]; //là tất cả các tham số được truyền vào hàm chính thực thi.
//   response?: any //là kết quả trả về sau hi hàm chính được gọi.
// }
// export function After(...afterFn: AfterFn[]) {
//   return (
//     _target: any,
//     _key: string | symbol,
//     descriptor: PropertyDescriptor,
//   ) => {
//     const originalMethod = descriptor.value;

//     descriptor.value = async function (...args: any[]) {
//       const response = await originalMethod.apply(this, args);

//       for (const iterator of afterFn) {
//         await iterator.call(this, { args, response });
//       }

//       return response
//     };

//     return descriptor;
//   };
// }

/* khai báo function sử lý logic cho After */
// import { AfterType } from "@libs/decorators/after";
// import getService from "@libs/hellpers/get-service";
// import { KhamService } from "modules/kham/kham.service";

// async function functionNameV1({ args, response }: AfterType) {
//   const [body] = args;
//   const khamService = await getService(KhamService);
//   await khamService.handleUpdateBacSiDaiDien({khamId: body?.khamId})
//   return
// }
// export default functionNameV1

/* triển khai tuần tự trên controller hoặc service After */
// @After(functionnameV1, functionnameV2)
// async handle(@Param() param: any, @Query() query, @Body() body) {
//     return true
// }

///////////////////////////////////////////////////////

/* Khai báo function type decorator Before */
// export type BeforeFn = (context: BeforeType) => void;
// export interface BeforeType {
//   args: any[]; //là tất cả các tham số được truyền vào hàm chính thực thi
// }
// export function Before(...input: BeforeFn[]) {
//   return (
//     _target: any,
//     _key: string | symbol,
//     descriptor: PropertyDescriptor,
//   ) => {
//     const originalMethod = descriptor.value;
//     descriptor.value = async function (...args: any[]) {
//       for (const iterator of input) {
//         await iterator.call(this, { args });
//       }
//       return originalMethod.apply(this, args);
//     };
//     return descriptor;
//   };
// }

/* khai báo function sử lý logic cho Before */
// import { BeforeType } from "@libs/decorators/before";
// import getService from "@libs/hellpers/get-service";
// import { HentraketquaService } from "modules/hentraketqua/hentraketqua.service";

// async function functionNameV1({ args }: BeforeType){
//   const [input, body] = args;
//   const hentraketquaService = await getService(HentraketquaService);
//   const { khamId, luotkhamId, para, loai, loaikhamId } = body;
//   const hentrainput={
//     luotkhamId,
//     khamId,
//     loaikhamId
//   }
//   await hentraketquaService.updateLoaiKhamHenTraKetQua(hentrainput)
// };
// export default functionNameV1

/* triển khai tuần tự trên controller hoặc service cho Before */
// @Before(functionNameV1, functionNameV2)
// async handle(@Param() param: any, @Query() query, @Body() body) {
//   return true
// }

///////////////////////////////////////////////////////

/* Khai báo function type decorator Around */
// type AroundFn = (context: AroundType) => Promise<any>;
// interface Params {
//   [key: string]: {};
// }
// export type AroundType = {
//   proceed: (...args: any[]) => Promise<any>; //hàm chạy chính được gọi.
//   args: any[]; //là tất cả các tham số được truyền vào hàm chính thực thi.
// }
// export function Around(aroundFn: AroundFn, ) {
//   return (
//     _target: any,
//     _key?: string | symbol,
//     descriptor?: TypedPropertyDescriptor<any>,
//   ) => {
//     if (descriptor) {
//       const originalMethod = descriptor.value;
//       descriptor.value = async function (...args: any[]) {
//         return await aroundFn.call(this, {
//           proceed: originalMethod.bind(this),
//           args,
//         });
//       };
//       return descriptor;
//     }
//   };
// }

/* khai báo function sử lý logic cho Around */
// import { AroundType } from "@libs/decorators/around";
// async function functionName({ args, proceed }: AroundType) {
//   //Các hành động bạn muốn thực trước khi function chính được thực thi.
//   const response = await proceed(...args);
//   //Các hành động bạn muốn thực hiện sau khi function chính được thực thi.
//   return response;
// }
// export default functionName;

/* triển khai tuần tự trên controller hoặc service cho Before */
// @Around(functionNameV1)
// @Around(functionNameV2)
// @Around(functionNameV3)
// async handle(@Param() param: any, @Query() query, @Body() body) {
//     return true
// }

///////////////////////////////////////////////////////

/* Function getService tấc cả thay thế cho class constructor mặc định của thư viện Nestjs */
// import { HttpException } from "@nestjs/common";
// import { app } from "../../main";

// const getService = async <T extends new (...args: any[]) => any>(
//   typeService: T,
// ): Promise<InstanceType<T>> => {
//   const service = (typeService as any).name.charAt(0).toLowerCase() + (typeService as any).name.slice(1);
//   const that = this as unknown
//   if (!that)
//     throw HttpException;
//   if (!that[service]) {
//     that[service] = (await app).get((typeService as any));
//   }
//   if (
//     process.env.NODE_ENV !== 'production' &&
//     that[service] !== (await app).get((typeService as any))
//   ) {
//     throw new Error(
//       `Service ${service} đã được định nghĩa type ${that[service].constructor.name} không thể định nghĩa lại bằng ${typeService} `,
//     );
//   }
//   return that[service];
// }
// export default getService

/* Cách sử dụng getService*/
// # Cách gọi service ngoài cách lấy trong constructor:
//   - Import:
//     typescript
//       import getService from "@libs/hellpers/get-service"
//       import { KhamService } from "modules/kham/kham.service"
//       import { DataSource } from "typeorm";
    
//   - Sử dụng:
//     typescript
//       const khamService = await getService(KhamService);
//       const connection = await getService(DataSource);
    
//     - Ví dụ trên lấy 1 khamService và 1 DataSource
