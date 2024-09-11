import { AroundType } from "helper/around.decorator";
import { UserActivityLogsService } from "../user_activity_logs.service";
import getService from "helper/getService";


async function aroundInsertDatabase ({ args, proceed  }: AroundType){
    const [query, body] = args;
  //Các hành động bạn muốn thực trước khi function chính được thực thi.
  const activityLog = await getService(UserActivityLogsService);

  console.log('around_query',query)
  console.log('around_body',body)


  const response = await proceed(...args); 
  console.log('around_response',response)

  //Các hành động bạn muốn thực hiện sau khi function chính được thực thi.

  if (response) {
    // logic
  }

  return response
};

export default aroundInsertDatabase
