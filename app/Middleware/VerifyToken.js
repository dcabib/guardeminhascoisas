const jwt = require('jsonwebtoken');
const DB = require('../../db');

/**
 * Middleware for authorizing requests
 * @param event 
 * @param context 
 * @param callback 
 */
module.exports.auth = (event, context, callback) => {
  console.info("Handler auth - starting");

  try {

    let token;

    if (!event.authorizationToken)
      return callback(null, 'Unauthorized');

    // Check header or url parameters or post parameters for token
    token = event.authorizationToken.split(' ')[1];
    // console.log (token);

    if (!token)
      // console.info("JWT Token not present in the request");
      return callback(null, 'Unauthorized');

    // Verifies secret and checks exp
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => 
    {
      if (err) {
        // console.info("Invalid Token in the request:" + err);

        return callback(null, 'Unauthorized');
      }
      // Check whether user ID is legit in the DB
      return DB.get({
        TableName:process.env.TABLENAME_USERS,
        Key: { id: decoded.id }
      }).promise().then((res) => {
        // If the user id exists in the db, save to request for use in other routes
        if (res && res.Item) return callback(null, generatePolicy(res.Item, 'Allow', event.methodArn))
        
        // Otherwise return an error
        return callback(null, 'Unauthorized');
      });
    });
  }
  catch (err) {
    console.log(err);
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
