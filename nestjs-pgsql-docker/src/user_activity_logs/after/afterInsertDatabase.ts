import { AfterType } from 'helper/after.decorator';
import getService from 'helper/getService';
import { UserActivityLogsService } from 'src/user_activity_logs/user_activity_logs.service';

async function AfterInsertDatabase({ args, response }: AfterType) {
  const activityLog = await getService(UserActivityLogsService);
  const [query, body] = args;

  console.log('after_query',query)
  console.log('after_body',body)
  console.log('after_reponse',response)
}


export default AfterInsertDatabase