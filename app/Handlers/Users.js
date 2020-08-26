const uuid = require('uuid');
const middy = require('middy');
const sanitizer = require('validator');
const bcrypt = require('bcryptjs');
const { jsonBodyParser } = require('middy/middlewares');

const DB = require('../../db');
const requestSchema = require('../Requests/Users');
const validatorMiddleware = require('../Middleware/Validator');
const apiResponseMiddleware = require('../Middleware/ApiResponse');
const { signToken, userByEmail, userById } = require('../Helpers/Users');
const TableName = process.env.TABLENAME_USERS;


/**
 * POST /register ----------------------------------------------------
 * User Sign Up
 * @param event
 * @param context
 * @param cb
 */
const register = async (event, context, cb) => {
//  console.info ("Handler register - started");
  
  const { firstName, lastName, email, password } = event.body;

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

  // console.log("Password: " + password);

  try {
    return userByEmail(params.Item.email) // Does the email already exist?
    .then(user => { 
      if (user) { 
        cb(null, {statusCode: 409, message: `User with provided email ${params.Item.email} already exists. Please use a different email....`})
      }
    })
    .then(() => DB.put(params).promise()) // Add the data to the DB
    .then(() => userById(params.Item.id)) // Get user data from DB
    .then(user => cb(null, {statusCode: 201, message: 'Success - you are now registered', data: { user },}));
  }
  catch (err) {
    console.err ("Internal server error while creating the user...");
    cb(null, {
      statusCode: 500,
      message: 'Internal Server error: ' + err,
    })
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
  console.info ("Handler login - started");

  const { email, password } = event.body;

  return userByEmail(email) // Does the email exist?
    .then(user => { 
      if (!user) { cb(null, {statusCode: 404, message: 'Username/Password is not correct: '}); 
      } 
      return user; 
    })
    .then(async (user) => { // Check if passwords match
      const passwordIsValid = await bcrypt.compare(password, user.password);
      if (!passwordIsValid) cb(null, {statusCode: 404, message: 'Username/Password is not correct: '});
      return user;
    })
    .then(user => cb(null, {
      statusCode: 200,
      message: 'Success - you are now logged in',
      data: { token: signToken(user.id, user.email), ...user }
    }));
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
const user = (event, context, cb) => cb(null, {
  message: 'Success - user data retrieved',
  data: event.requestContext.authorizer.user,
});

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
  const { firstName, lastName, email, password } = event.body;
  const id = event.requestContext.authorizer.principalId;

  // Create update query based on user input
  let query = 'set firstName=:fn, lastName=:ln, email=:em, updatedAt=:ud';
  const queryValues = {
    ':fn': sanitizer.trim(firstName),
    ':ln': sanitizer.trim(lastName),
    ':em': sanitizer.normalizeEmail(sanitizer.trim(email)),
    ':ud': new Date().getTime(),
  };

  // Password is optional, if provided, pass to query
  if (password) {
    query += ', password=:pw';
    queryValues[':pw'] = await bcrypt.hash(password, 8);
  }

  const params = {
    TableName,
    Key: { id },
    UpdateExpression: query,
    ExpressionAttributeValues: queryValues,
    ReturnValues: 'ALL_NEW',
  }

  return userByEmail(queryValues[':em']) // Check if the new email already exists
    .then((foundUser) => {
      if (foundUser && foundUser.email) {
        // New email exists, and doesn't belong to the current user
        if (foundUser.email === queryValues[':em'] && foundUser.id !== id) {
          throw new Error('That email belongs to another user');
        }
      }
    })
    .then(() => DB.update(params).promise()) // Update the data to the DB
    .then(user => cb(null, {message: 'Success - user updated', data: user }));
}

module.exports.update = middy(update)
  .use(jsonBodyParser())
  .use(validatorMiddleware({ inputSchema: requestSchema.update }))
  .use(apiResponseMiddleware());
