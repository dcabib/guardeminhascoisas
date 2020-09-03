const uuid = require('uuid');
const middy = require('middy');
const sanitizer = require('validator');
const bcrypt = require('bcryptjs');
const { jsonBodyParser } = require('middy/middlewares');

const DB = require('../../db');

const requestSchema = require('../Requests/Users');
const validatorMiddleware = require('../Middleware/Validator');
const apiResponseMiddleware = require('../Middleware/ApiResponse');
const { signToken, userByEmail, userById, updateUser, deleteUsers } = require('../Helpers/Users');

const TableName = process.env.TABLENAME_USERS;
const TableNameDeleted = process.env.TABLENAME_USERS_DELETED;


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
        id: await uuid.v4(),
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
          cb(null, {statusCode: 409, message: `User with provided email ${params.Item.email} already exists. Please use a different email...`});
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
  console.debug ("*** Handler login - started");
  console.debug ("*** Handler login - started");
  console.debug ("*** Handler login - started");
  console.debug ("*** Handler login - started");
  console.debug ("*** Handler login - started");
  console.debug ("*** Handler login - started");
  console.debug ("*** Handler login - started");
  console.debug ("*** Handler login - started");
  console.debug ("*** Handler login - started");
  console.debug ("*** Handler login - started");
  console.debug ("*** Handler login - started");
  console.debug ("*** Handler login - started");
  console.debug ("*** Handler login - started");
  console.debug ("*** Handler login - started");
  console.debug ("*** Handler login - started");


  const { email, password } = event.body;

  console.debug (`*** Handler login - email: : ${email}, password: : ${password}`);

  try {

    return userByEmail(email) // Does the email exist?
        .then(user => { 
            console.debug ("*** Handler login - User was returned");
            if (!user) { 
                console.debug ("*** Handler login - User is not valid");
                cb(null, {statusCode: 404, message: 'Invalid Username or Password...'}); 
            } 
            return user; 
        })
        .then(async (user) => {
            console.debug ("*** Handler login - Check if passwords match");
            const passwordIsValid = await bcrypt.compare(password, user.password);
            if (!passwordIsValid) {
                console.debug ("*** Handler login - Password does not match");
                cb(null, {statusCode: 404, message: 'Invalid Username or Password...'});
            }
            return user;
        })
        .then(user => {
            console.debug ("*** Handler login - User login sucessful");
            
            // Generating a authentication token
            const genToken = signToken(user.id, user.email);
            console.debug ("*** Handler login - Token was generated: " + genToken);

            // Updating user / token informatio on DB 
            console.debug ("*** Handler login - User: " + JSON.stringify(user.id)); 

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

const update = async (event, context, cb) => {
  console.debug ("*** Handler update - started.");

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
              return cb(null, {statusCode: 409, message: 'The provided email belongs to another user. Please use a different email...'});
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
              console.error ("*** Handler update - Error updating user informnatin" + JSON.stringify(err));
              cb(null, {statusCode: err.statusCode, message: 'Internal Server error while updating user:' + JSON.stringify(err)});
          }
        });
      });
    } 
    catch (err) 
    {
      console.error ("Handler update - Internal server error while updating user..." + JSON.stringify(err));
      cb(null, { statusCode: err.statusCode, message: 'Handler update - Internal Server error: ' + JSON.stringify(err)});
    }
  }
  
  
module.exports.update = middy(update)
  .use(jsonBodyParser())
  .use(validatorMiddleware({ inputSchema: requestSchema.update }))
  .use(apiResponseMiddleware());
  

/**
 * DELETE /user ----------------------------------------------------
 * Delete my User account
 * @param event
 * @param context
 * @param cb
 */

const deleteUser = async (event, context, cb) => {
  console.debug ("*** Handler delete - started.");

  const userId = event.requestContext.authorizer.user.id;
  console.debug ("*** Handler delete - User to be deleted: " + userId);

  try
  {
    return userById(userId) // Check if the user exists (of course exists)
    .then((foundUser) => 
    {
      if (!foundUser) {
        console.debug ("*** Handler delete - user was not found");
        return cb(null, {statusCode: 404, message: 'User was not found'});
      }

      console.log ("######## user: " + JSON.stringify(foundUser));

      return deleteUsers({TableName, Key: { id: userId }}) 
      .then((user) => 
      {
        if (!user) {
          console.error ("*** Handler delete - Error deleting" + JSON.stringify(user));
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
  
  
module.exports.deleteUser = middy(deleteUser)
  .use(jsonBodyParser())
  .use(apiResponseMiddleware());

/**
 *  /stream_listener ----------------------------------------------------
 * Listener DynamoDB streams 
 * @param event
 * @param context
 * @param cb
 */

const stream_listener = async (event, context, cb) => {
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
  catch (err) 
  {
    console.error ("Handler stream_listener - Internal server error ..." + JSON.stringify(err));
    cb(null, { statusCode: err.statusCode, message: 'Handler stream_listener - Internal Server error: ' + JSON.stringify(err)});
  }

}
  
module.exports.stream_listener = middy(stream_listener)
  .use(jsonBodyParser());
