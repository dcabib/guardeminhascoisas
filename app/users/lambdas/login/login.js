const middy = require('middy');
const sanitizer = require('validator');
const bcrypt = require('bcryptjs');
const { jsonBodyParser } = require('middy/middlewares');

const requestSchema = require('../Helpers/Requests/Users');
const validatorMiddleware = require('../../../Middleware/Validator');
const apiResponseMiddleware = require('../../../Middleware/ApiResponse');
const { userByEmail, signToken, updateUser } = require('../Helpers/UsersModel');

/**
 * POST /login ----------------------------------------------------
 * Logs a user in - returns a JWT token
 * @param event
 * @param context
 * @param cb
 */
const handler = async (event, context, cb) => {
    console.debug ("*** Handler login - started");
  
    const { email, password } = event.body;  
    console.debug (`*** Handler login - email: : ${email}, password: : ${password}`);
  
    try {
  
      return userByEmail(email) // Does the email exist?
          .then(user => { 
              console.debug ("*** Handler login - User was returned");
              if (!user) { 
                  console.debug ("*** Handler login - User is not valid");
                  return cb(null, {statusCode: 404, message: 'Invalid Username or Password...'}); 
              } 

              console.debug ("*** Handler login - Check if passwords match");
              const passwordIsValid = bcrypt.compareSync(password, user.password);
              if (!passwordIsValid) {
                  console.debug ("*** Handler login - Password does not match");
                  return cb(null, {statusCode: 404, message: 'Invalid Username or Password...'});
              } 
              console.debug ("*** Handler login - Password matches. User login sucessful");
              
              // Generating a authentication token
              const genToken = signToken(user.id, user.email);
              console.debug ("*** Handler login - Token was generated: " + genToken);
  
              // Updating user / token informatio on DB 
              console.debug ("*** Handler login - updating token to this user: " + JSON.stringify(user.id)); 
  
              const params = {
                id: user.id,
                UpdateExpression: 'set lastToken = :lt',
                ExpressionAttributeValues: {':lt': sanitizer.trim(genToken)},
              };
              
              console.debug ("*** Handler login - updating user information to add token ");
  
              return updateUser(params) // Check if the new email already exists
                .then(user => 
                {
                  if (user) {
                    console.debug ("*** Handler login - Return was successful - user information was updated");
                    cb(null, {statusCode: 200, message: 'Success - you are now logged in', data: { token: genToken }})
                  } else {
                      console.debug ("*** Handler login - Error updating user informnatin" + JSON.stringify(err));
                      cb(null, {statusCode: err.statusCode, message: 'Internal Server error while updating user:' + JSON.stringify(err)});
                  }
                });
          })
      }
      catch (err) {
        console.err ("Handler login - Internal server error while login user..." + JSON.stringify(err));
        cb(null, { statusCode: err.statusCode, message: 'Handler login - Internal Server error: ' + JSON.stringify(err)});
      }
  }
  
  module.exports.handler = middy(handler)
    .use(jsonBodyParser())
    .use(validatorMiddleware({ inputSchema: requestSchema.login }))
    .use(apiResponseMiddleware());
  