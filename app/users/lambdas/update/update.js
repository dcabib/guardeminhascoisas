const middy = require('middy');
const sanitizer = require('validator');
const bcrypt = require('bcryptjs');
const { jsonBodyParser } = require('middy/middlewares');

const requestSchema = require('../Helpers/Requests/Users');
const validatorMiddleware = require('../../../Middleware/Validator');
const apiResponseMiddleware = require('../../../Middleware/ApiResponse');
const { userByEmail, userById, updateUser, createParamsforUpdate } = require('../Helpers/UsersModel');

/**
 * PUT /user ----------------------------------------------------
 * Update my User account
 * @param event
 * @param context
 * @param cb
 */

const handler = async (event, context, cb) => {
  console.debug ("*** Handler update - started.");

  try 
  {
    const { firstName, lastName, email, password } = event.body;
    const id = event.requestContext.authorizer.principalId;

    // Checks if there is any possible update into user table
    if (!firstName && !lastName && !email && !password) {
      console.debug ("*** Handler update - No user information to update. Please provide at least one parameter (First Name, Last Name, Email or Password)...");
      return cb(null, {statusCode: 400, message: "No user information to update. Please provide at least one parameter (First Name, Last Name, Email or Password)..."});
    }

    console.debug ("*** Handler update - ID from requester: " + id);
    console.debug (`*** Handler update - firstName: ${firstName}, lastName: ${lastName}, email: ${email}, password: ${password}`);

    // Checks if new email is already in use
    if (email) {
      console.debug ("*** Handler update - A valid email was provided.... Check if the new email already exists: " + email);

      const foundUser = await userByEmail(email); 
      if (foundUser && foundUser.email){  
        // New email exists, and doesn't belong to the current user
        if (foundUser.email === email && foundUser.id !== id) {
            console.debug ("*** Handler update - WARNING: That email belongs to another user");
            return cb(null, {statusCode: 409, message: 'The provided email belongs to another user. Please use a different email...'});
        }
      }
    }

    console.debug (`*** Handler update - This email ${email} is not in use.`);

    console.debug ("*** Handler update - getting parameter to update user");
    const params = await createParamsforUpdate (id, firstName, lastName, email, password);

    console.debug ("*** Handler update - Updating user information");
    const user = await updateUser(params);
    if (user) {
      console.debug ("*** Handler update - Return was successful - user information was updated");
      delete user[password]; // hire user password
      cb(null, {statusCode: 200, message: 'User information was updated', data: { user }});
    } else {
        console.debug ("*** Handler update - Error updating user informnatin" + JSON.stringify(err));
        cb(null, {statusCode: err.statusCode, message: 'Internal Server error while updating user:' + JSON.stringify(err)});
    }
  }
  catch (err) {
    console.error ("*** Handler update - Internal server error while updating user..." + JSON.stringify(err));
    cb(null, { statusCode: 500, message: 'Handler update - Internal Server error: ' + JSON.stringify(err)});
  }
}
  
module.exports.handler = middy(handler)
  .use(jsonBodyParser())
  .use(validatorMiddleware({ inputSchema: requestSchema.update }))
  .use(apiResponseMiddleware());
  