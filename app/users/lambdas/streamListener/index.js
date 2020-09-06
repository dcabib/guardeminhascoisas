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
        // console.debug ("*** Handler stream_listener -  Record: " + JSON.stringify (record));
        console.debug ("id:        " + JSON.stringify(record.dynamodb.OldImage.id.S));
        console.debug ("firstName: " + JSON.stringify(record.dynamodb.OldImage.firstName.S));
        console.debug ("lastName:  " + JSON.stringify(record.dynamodb.OldImage.lastName.S));
        console.debug ("createdAt: " + JSON.stringify(record.dynamodb.OldImage.createdAt.N));
        console.debug ("password:  " + JSON.stringify(record.dynamodb.OldImage.password.S));
        console.debug ("level:     " + JSON.stringify(record.dynamodb.OldImage.level.S));
        console.debug ("email:     " + JSON.stringify(record.dynamodb.OldImage.email.S));
        console.debug ("updatedAt: " + JSON.stringify(record.dynamodb.OldImage.updatedAt.N));

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
          } else
          console.log ("User information was updated into user-deleted database");

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