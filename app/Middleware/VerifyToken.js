const jwt = require('jsonwebtoken');
const DB = require('../../db');


/**
 * Middleware for authorizing requests
 * @param event 
 * @param context 
 * @param callback 
 */
module.exports.auth = (event, context, cb) => {
  console.debug("*** Handler auth - starting");

  try {

    let token;

    if (!event.authorizationToken)
    {
      console.debug("*** Handler auth - No authorization token was provided");
      return cb(null, 'Unauthorized');
    }

    // Check header or url parameters or post parameters for token
    token = event.authorizationToken.split(' ')[1];
    console.log ("*** Handler auth - " + token);

    if (!token) {
      console.debug("*** Handler auth - JWT Token not present in the request");
      return cb(null, 'Unauthorized');
    }

    console.debug("*** Handler auth - Verifies secret and checks expiration");
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => 
    {
      if (err) {
        console.debug("*** Handler auth - Invalid Token in the request");
        return cb(null, {statusCode: 403, message: 'Invalid token...'}); 
      }
      // Check whether user ID is legit in the DB
      return DB.get({
        TableName:process.env.TABLENAME_USERS,
        Key: { id: decoded.id }
      }).promise().then((res) => {
        // If the user id exists in the db, save to request for use in other routes
        if (res && res.Item) 
        {
          console.debug("*** Handler auth - SUCCESS: Valid user token");
          return cb(null, generatePolicy(res.Item, 'Allow', event.methodArn))
        }
        
        // Otherwise return an error
        console.debug("*** Handler auth - Invalid Token in the request");
        return cb(null, 'Unauthorized');
      });
    });
  }
  catch (err) {
    console.error ("*** Handler auth - Error during authorization");
  }
};

/**
 * Generate the JWT Auth Policy
 * @param user 
 * @param effect 
 * @param resource 
 */
const generatePolicy = (user, effect, resource) => {
  const authResponse = {
    context: { user },
    principalId: user.id,
  }

  if (effect && resource) {
    const statementOne = {
      'Action': 'execute-api:Invoke',
      'Effect': effect,
      'Resource': resource,
    };

    const policyDocument = {
      'Version': '2012-10-17',
      'Statement': [statementOne],
    };

    authResponse.policyDocument = policyDocument;
  }

  return authResponse;
}
