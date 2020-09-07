const middy = require('middy');
const { jsonBodyParser } = require('middy/middlewares');

const DB = require('../../../../database/db');

const TableNameDeleted = process.env.TABLENAME_USERS_DELETED;

/**
 *  /stream_listener ----------------------------------------------------
 * Listener DynamoDB streams 
 * @param event
 * @param context
 * @param cb
 */

const handler = async (event, context, cb) => {
  console.debug ("*** Handler stream_listener - started.");

  try {
    for (const record of event.Records) {
      if (record.eventName === "REMOVE")
      {
        const params = {
          TableName: TableNameDeleted,
          Item: {
            id:        record.dynamodb.OldImage.id.S,
            firstName: record.dynamodb.OldImage.firstName.S,
            lastName:  record.dynamodb.OldImage.lastName.S,
            email:     record.dynamodb.OldImage.email.S,
            password:  record.dynamodb.OldImage.password.S,
            level:     record.dynamodb.OldImage.level.S,
            createdAt: record.dynamodb.OldImage.createdAt.N,
            updatedAt: record.dynamodb.OldImage.updatedAt.N,
          },
        };

        DB.put(params, function (err, data) {
          if (err) {
            console.error ("Error trying insert deleted user into user-deleted database:" + JSON.stringify(err));
            return;
          }
          console.log ("User information was updated into user-deleted database" + JSON.stringify(params.Item));

        });
      } else {
        console.debug ("*** Handler stream_listener - stream event ignored: " + record.eventName);
      }
    }
  } 
  catch (err) {
    console.error ("Handler stream_listener - Internal server error ..." + JSON.stringify(err));
    cb(null, { statusCode: err.statusCode, message: 'Handler stream_listener - Internal Server error: ' + JSON.stringify(err)});
  }
}
  
module.exports.handler = middy(handler)
  .use(jsonBodyParser());