import { BeforeType } from 'helper/before.decorator';
import getService from 'helper/getService';
import { UserActivityLogsService } from 'src/user_activity_logs/user_activity_logs.service';

async function BeforeInsertDatabase({ args }: BeforeType) {
  const activityLog = await getService(UserActivityLogsService);
  const [query, body] = args;

  console.log('before_query',query)
  console.log('before_body',body)
}


export default BeforeInsertDatabase