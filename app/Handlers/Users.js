const uuid = require('uuid');
const middy = require('middy');
const sanitizer = require('validator');
const bcrypt = require('bcryptjs');
const { jsonBodyParser } = require('middy/middlewares');

const DB = require('../../db');

const requestSchema = require('../Requests/Users');
const validatorMiddleware = require('../Middleware/Validator');
const apiResponseMiddleware = require('../Middleware/ApiResponse');
const { signToken, userByEmail, userById, updateUser } = require('../Helpers/Users');

const TableName = process.env.TABLENAME_USERS;


/**
 * POST /register ----------------------------------------------------
 * User Sign Up
 * @param event
 * @param context
 * @param cb
 */
const register = async (event, context, cb) => {
    console.debug ("*** Handler register - started");
    
    const { firstName, lastName, email, password } = event.body;
  
    console.debug (`*** Handler register - firstName: ${firstName}, lastName: ${lastName}, email: : ${email}, password: : ${password}`);
  
    const params = {
      TableName,
      Item: {
        id: await uuid.v1(),
        firstName: sanitizer.trim(firstName),
        lastName: sanitizer.trim(lastName),
        email: sanitizer.normalizeEmail(sanitizer.trim(email)),
        password: bcrypt.hashSync(password, 8),
        level: 'standard',
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
      },
    };
  
    console.debug ("*** Handler register - Insert / Put params: " + JSON.stringify(params));
  
    try {
      return userByEmail(params.Item.email) // Does the email already exist?
      .then(user => { 
        console.debug ("*** Handler register - Check if there is another user with provided email: " + params.Item.email);
        if (user) { 
          console.debug ("*** Handler register - Valid user was founded with provided email");
          cb(null, {statusCode: 409, message: `User with provided email ${params.Item.email} already exists. Please use a different email....`});
        }
      })
      .then(() => {
        console.debug ("*** Handler register - No user found in DB with provieded email. Insert/Create user into DB");
        return DB.put(params).promise()
      })
      .then(() => {
        console.debug ("*** Handler register - Check if the user was created by ID and get user data");
        return userById(params.Item.id);
      })
      .then(user => {
        console.debug ("*** Handler register - User creation / registration sucesful");
        cb(null, {statusCode: 201, message: 'Success - you are now registered', data: { user },})}
      );
    }
    catch (err) {
      console.err ("Handler register - Internal server error while creating the user..." + JSON.stringify(err));
      cb(null, { statusCode: err.statusCode, message: 'Handler register - Internal Server error: ' + JSON.stringify(err)});
    }
  }

module.exports.register = middy(register)
  .use(jsonBodyParser())
  .use(validatorMiddleware({ inputSchema: requestSchema.register }))
  .use(apiResponseMiddleware());

/**
 * POST /login ----------------------------------------------------
 * Logs a user in - returns a JWT token
 * @param event
 * @param context
 * @param cb
 */
const login = async (event, context, cb) => {
  console.debug ("*** Handler login - started");

  const { email, password } = event.body;

  console.debug (`*** Handler login - email: : ${email}, password: : ${password}`);

  try {

    return userByEmail(email) // Does the email exist?
        .then(user => { 
            console.debug ("*** Handler login - User was returned");
            if (!user) { 
                console.debug ("*** Handler login - User is not valid");
                cb(null, {statusCode: 404, message: 'Username/Password provided is not correct'}); 
            } 
            return user; 
        })
        .then(async (user) => {
            console.debug ("*** Handler login - Check if passwords match");
            const passwordIsValid = await bcrypt.compare(password, user.password);
            if (!passwordIsValid) {
                console.debug ("*** Handler login - Password does not match");
                cb(null, {statusCode: 404, message: 'Username/Password is not correct: '});
            }
            return user;
        })
        .then(user => {
            console.debug ("*** Handler login - User login sucessful");
            
            // Generating a authentication token
            const genToken = signToken(user.id, user.email);
            console.debug ("*** Handler login - Token was generated: " + genToken);

            // Updating user informatio on DB
            console.log ("*** Handler login - User: " + JSON.stringify(user.id)); 

            const params = {
              TableName,
              Key: {"id": user.id},
              UpdateExpression: 'set lastToken=:lt',
              ExpressionAttributeValues: {':lt': sanitizer.trim(genToken)},
              ReturnValues: 'ALL_NEW',
            };
            
            console.debug ("*** Handler login - updating user information to add token ");

            return updateUser(params) // Check if the new email already exists
              .then((user) => 
              {
                if (user) {
                  console.debug ("*** Handler login - Return was successful - user information was updated");
                  cb(null, {statusCode: 200, message: 'Success - you are now logged in', data: { token: user.Attributes.lastToken }})
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

module.exports.login = middy(login)
  .use(jsonBodyParser())
  .use(validatorMiddleware({ inputSchema: requestSchema.login }))
  .use(apiResponseMiddleware());

/**
 * GET /user ----------------------------------------------------
 * Returns authenticated user's login details
 * @param event
 * @param context
 * @param cb
 */
const user = (event, context, cb) => {
    console.debug ("*** Handler user - staterd");
    return cb(null, {status: 200, message: 'Success - user data retrieved', data: event.requestContext.authorizer.user,});
};

module.exports.user = middy(user)
  .use(apiResponseMiddleware());

/**
 * PUT /user ----------------------------------------------------
 * Update my User account
 * @param event
 * @param context
 * @param cb
 */

const update = async (event, context, cb) => 
{
  console.debug ("*** Handler update - started.");
  // console.debug ("*** event: ." + JSON.stringify(event));

  try 
  {
      const { firstName, lastName, email, password } = event.body;
      const id = event.requestContext.authorizer.principalId;
  
      console.debug ("*** Handler update - ID from requester: " + id);
      console.debug (`*** Handler update - firstName: ${firstName}, lastName: ${lastName}, email: ${email}, password: ${password}`);
  
      // Create update query based on user input
      let query = 'set firstName=:fn, lastName=:ln, email=:em, updatedAt=:ud';
      const queryValues = {
      ':fn': sanitizer.trim(firstName),
      ':ln': sanitizer.trim(lastName),
      ':em': sanitizer.normalizeEmail(sanitizer.trim(email)),
      ':ud': new Date().getTime(),
      };
  
      // Password is optional, if provided, pass to query
      if (password) 
      {
        console.debug ("*** Handler update - User has choosen to update password");
        query += ', password=:pw';
        queryValues[':pw'] = await bcrypt.hash(password, 8);
      }
  
      console.debug ("*** Handler update - Update query: " + JSON.stringify(query));
      console.debug ("*** Handler update - Update values: " + JSON.stringify(queryValues));
  
      const params = {
        TableName,
        Key: { id },
        UpdateExpression: query,
        ExpressionAttributeValues: queryValues,
        ReturnValues: 'ALL_NEW',
      }
  
      console.debug ("*** Handler update - Update params: " + JSON.stringify(params));
      console.debug ("*** Handler update - Calling DB client to find user by email");

      return userByEmail(email) // Check if the new email already exists
      .then((foundUser) => 
      {
        console.debug ("*** Handler update - User Email was found");

        if (foundUser && foundUser.email) 
        {
          console.debug ("*** Handler update - User was found and email exists");
  
          // New email exists, and doesn't belong to the current user
          if (foundUser.email === email && foundUser.id !== id) 
          {
              console.debug ("*** Handler update - WARNING: That email belongs to another user");
              return cb(null, {statusCode: 409, message: 'Error: The provided email belongs to another user'});
          }
        }
        // Update user information
        console.debug ("*** Handler update - Update user information");
        return updateUser(params) // Check if the new email already exists
        .then((user) => 
        {
          if (user) {
            console.debug ("*** Handler update - Return was successful - user information was updated");
            cb(null, {statusCode: 200, message: 'User information was updated', data: { firstName: user.Attributes.firstName, lastName: user.Attributes.lastName, email: user.Attributes.email}})
          } else {
              console.debug ("*** Handler login - Error updating user informnatin" + JSON.stringify(err));
              cb(null, {statusCode: err.statusCode, message: 'Internal Server error while updating user:' + JSON.stringify(err)});
          }
        });
      });
    } 
    catch (err) 
    {
      console.err ("Handler update - Internal server error while login user..." + JSON.stringify(err));
      cb(null, { statusCode: err.statusCode, message: 'Handler update - Internal Server error: ' + JSON.stringify(err)});
    }
  }
  
  
module.exports.update = middy(update)
  .use(jsonBodyParser())
  .use(validatorMiddleware({ inputSchema: requestSchema.update }))
  .use(apiResponseMiddleware());
  