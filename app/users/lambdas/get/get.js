const middy = require('middy');
const apiResponseMiddleware = require('../../../Middleware/ApiResponse');
const { userById } = require('../Helpers/UsersModel');

/**
 * GET /user ----------------------------------------------------
 * Returns authenticated user's login details
 * @param event
 * @param context
 * @param cb
 */
const handler = async (event, context, cb) => {
  console.debug ("*** Handler user - staterd");
  //console.debug ("*** Handler user - event: " + JSON.stringify(event));

  const userId = event.requestContext.authorizer.principalId;
  console.debug ("*** Handler user - id: " + userId);

  try
  {
    return userById(userId) // Check if the user exists (of course exists)
    .then((foundUser) => 
    {
      if (!foundUser) {
        console.debug ("*** Handler user - user was not found");
        return cb(null, {statusCode: 404, message: 'User with this token / credentials was not found'});
      }

      console.debug ("*** Handler user - Success - user data retrieved: " + JSON.stringify(foundUser));
      cb(null, {statusCode: 200, message: 'Success - user data retrieved', data : {foundUser}})
    });
  } 
  catch (err) 
  {
    console.error ("Handler user - Internal server error while getting user info..." + JSON.stringify(err));
    cb(null, { statusCode: err.statusCode, message: 'Handler user - Internal Server error: ' + JSON.stringify(err)});
  }
};

module.exports.handler = middy(handler)
  .use(apiResponseMiddleware());