const middy = require('middy');
const sanitizer = require('validator');
const bcrypt = require('bcryptjs');
const { jsonBodyParser } = require('middy/middlewares');

const requestSchema = require('../Helpers/Requests/Users');
const validatorMiddleware = require('../../../Middleware/Validator');
const apiResponseMiddleware = require('../../../Middleware/ApiResponse');
const { userByEmail, userById, updateUser } = require('../Helpers/UsersModel');

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
    if (!firstName && !lastName && !email && !password)
      return cb(null, {statusCode: 400, message: "No user information to update. Please provide at least one parameter (First Name, Last Name, Email or Password)..."});

    console.debug ("*** Handler update - ID from requester: " + id);
    console.debug (`*** Handler update - firstName: ${firstName}, lastName: ${lastName}, email: ${email}, password: ${password}`);

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
    } else {
      console.debug ("*** Handler update - email will not be changed");
    }

    console.debug (`*** Handler update - This email ${email} is not in use.`);

    console.debug (`*** Handler update - Getting lastToken from user: ${id}.`);
    const findRealUser = await userById(id); 
    if (findRealUser.lastToken != event.headers.Authorization.split(' ')[1]){
      console.debug ("foundUser.lastToken: " + findRealUser.lastToken);
      console.debug ("foundUser.lastToken: " + event.headers.Authorization.split(' ')[1]);

      console.debug ("*** Handler update - WARNING: Valid but expired token");
      return cb(null, {statusCode: 409, message: "The provided token is valid but was alread renewed"});
    }

    console.debug ("*** Handler update - The provided token is valid and it is the same stored in the lastToken field in database");

    const query = await createParams (firstName, lastName, email, password);

    const params = {
      id : id,
      UpdateExpression: query[0],
      ExpressionAttributeValues: query[1],
    };

    console.debug ("*** Handler update - Updating user information");
    const user = await updateUser(params);
    if (user) {
      console.debug ("*** Handler update - Return was successful - user information was updated");
      cb(null, {statusCode: 200, message: 'User information was updated'});
    } else {
        console.error ("*** Handler update - Error updating user informnatin" + JSON.stringify(err));
        cb(null, {statusCode: err.statusCode, message: 'Internal Server error while updating user:' + JSON.stringify(err)});
    }
  }
  catch (err) 
  {
    console.error ("*** Handler update - Internal server error while updating user..." + JSON.stringify(err));
    cb(null, { statusCode: 500, message: 'Handler update - Internal Server error: ' + JSON.stringify(err)});
  }
}
  
const createParams = async(firstName, lastName, email, password) => {
  console.debug ("*** Handler update - createParams - stating");

  let query = '';
  let queryValues = {};

  // Create update query based on user input
  // Check whitch values to change in used database
  if (firstName) {
    query += 'set firstName=:fn, '; queryValues[':fn'] = sanitizer.trim(firstName) 
  }

  if (lastName) {
    if (query === '') 
        query+= 'set ';
    query+= 'lastName=:ln, ';
    queryValues[':ln'] = sanitizer.trim(lastName);
  }
  
  if (email) {
    if (query === '') 
      query+= 'set ';
    query+= 'email=:em, ';
    queryValues[':em'] = sanitizer.normalizeEmail(sanitizer.trim(email))
  }
  
  // Mandatory update
  if (query === '') 
    query+= 'set ';
  query += 'updatedAt=:ud';
  queryValues[':ud'] = new Date().getTime();

  // Password is optional, if provided, pass to query
  if (password) 
  {
    console.debug ("*** Handler update - User has choosen to update password");
    query += ', password=:pw';
    queryValues[':pw'] = await bcrypt.hash(password, 8);
  }

  return [query, queryValues];
}

  
module.exports.handler = middy(handler)
  .use(jsonBodyParser())
  .use(validatorMiddleware({ inputSchema: requestSchema.update }))
  .use(apiResponseMiddleware());
  