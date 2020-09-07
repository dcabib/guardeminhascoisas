const middy = require('middy');
const sanitizer = require('validator');
const bcrypt = require('bcryptjs');
const { jsonBodyParser } = require('middy/middlewares');


const requestSchema = require('../Helpers/Requests/Users');
const validatorMiddleware = require('../../../Middleware/Validator');
const apiResponseMiddleware = require('../../../Middleware/ApiResponse');
const { userByEmail, userById, addUser } = require('../Helpers/UsersModel');

const TableName = process.env.TABLENAME_USERS;

/**
 * POST /register ----------------------------------------------------
 * User Sign Up
 * @param event
 * @param context
 * @param cb
 */
const handler = async (event, context, cb) => {
    console.debug ("*** Handler register - started");
    
    const { firstName, lastName, email, password } = event.body;
  
    console.debug (`*** Handler register - firstName: ${firstName}, lastName: ${lastName}, email: : ${email}, password: : ${password}`);
  
    try {
      return userByEmail(email) // Does the email already exist?
      .then(user => { 
        console.debug ("*** Handler register - Check if there is valid user info with provided email: " + email);
        if (user) { 
          console.debug ("*** Handler register - Valid user was found with provided email");
          return cb(null, {statusCode: 409, message: `User with provided email ${email} already exists. Please use a different email...`});
        } else {
          console.debug ("*** Handler register - No user found in DB with provieded email. Insert/Create user into DB");
          const ret =  addUser (firstName, lastName, email, password);
          if (ret) {
            console.debug ("*** Handler register - User creation / registration succesful");
            cb(null, {statusCode: 201, message: 'Success - you are now registered', data: { firstName, lastName, email }})
          } else { 
            console.debug ("*** Handler register - User creation not executed - internal error");
            cb(null, {statusCode: 500, message: 'Internal server error creating user', data: { firstName, lastName, email }})
          }
        } 
      });
    }
    catch (err) {
      console.error ("Handler register - Internal server error while creating the user..." + JSON.stringify(err));
      cb(null, { statusCode: err.statusCode, message: 'Handler register - Internal Server error: ' + JSON.stringify(err)});
    }
  }

module.exports.handler = middy(handler)
  .use(jsonBodyParser())
  .use(validatorMiddleware({ inputSchema: requestSchema.register }))
  .use(apiResponseMiddleware());
