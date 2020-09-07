const middy = require('middy');
const apiResponseMiddleware = require('../../../Middleware/ApiResponse');
const { jsonBodyParser } = require('middy/middlewares');
const { userById, deleteUsers } = require('../Helpers/UsersModel');

const TableName = process.env.TABLENAME_USERS;

/**
 * DELETE /user ----------------------------------------------------
 * Delete my User account
 * @param event
 * @param context
 * @param cb
 */

const handler = async (event, context, cb) => {
  console.debug ("*** Handler delete - started.");

  const userId = event.requestContext.authorizer.principalId;
  console.debug ("*** Handler delete - User to be deleted: " + userId);

  try
  {
    // Check if the user exists (of course exists)
    return userById(userId) 
    .then((foundUser) => {
      if (!foundUser) {
        console.debug ("*** Handler delete - user was not found");
        return cb(null, {statusCode: 404, message: 'User was not found'});
      }

      return deleteUsers(userId) 
      .then((user) => 
      {
        if (!user) {
          console.debug ("*** Handler delete - Error deleting" + JSON.stringify(user));
          cb(null, {statusCode: err.statusCode, message: 'Internal Server error while deleting user:' + JSON.stringify(user)});
        } else {
          console.debug ("*** Handler delete - Return was successful deleted");
          cb(null, {statusCode: 200, message: 'User was successfully deleted'})
        }
      });
    });
  } 
  catch (err) 
  {
    console.error ("Handler delete - Internal server error while deleting (updating) user info..." + JSON.stringify(err));
    cb(null, { statusCode: err.statusCode, message: 'Handler delete - Internal Server error: ' + JSON.stringify(err)});
  }
}

module.exports.handler = middy(handler)
  .use(jsonBodyParser())
  .use(apiResponseMiddleware());
  