const jsonwebtoken = require('jsonwebtoken');
const { userById } = require ("../Helpers/UsersModel")

const parseArn = arn => {
  const [left, right] = arn.split('/', 2);
  const [,, service, region, accountId, apiId] = left.split(':');
  const [stage, method, resourcePath] = right.split('/');
  return {
    service, region, accountId, apiId, stage, method, resourcePath,
  };
};

module.exports.auth = async event => {
  console.debug ("*** Authentication - auth - starting");

  console.log (JSON.stringify(event));

  const token = event.authorizationToken.split(' ')[1];
  
  // Define default DENY authorization
  let authResponse = {
    principalId: 'unknown',
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Deny',
          Resource: '*',
          Action: [],
        },
      ],
    }
  };

  let decodedToken; // Store decodeed token

  try {

    // Try decode de token and catch any exception if not valid or not available
    try {
      console.debug ("*** Authentication - auth - Decoding token with JWT");
      decodedToken = jsonwebtoken.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.debug ("*** Authentication - auth - Invalid token");
    }

    if (decodedToken) {
      console.debug ("*** Authentication - auth - Token was decoded");

      const { service, region, accountId, apiId, stage } = parseArn(event.methodArn);
      const userId = decodedToken.id;
      const userEmail = decodedToken.email;

      // Check if the token is the same stored in LastToken 
      console.debug (`*** Authentication - auth - Getting lastToken from user: ${userId}.`);
      const findRealUser = await userById(userId); 

      if (findRealUser) {
        console.debug (`*** Authentication - auth - Same user had previosly logged in...`);

        if (findRealUser.lastToken) {
          console.debug (`*** Authentication - auth - lastToken: ${findRealUser.lastToken}` );
          console.debug (`*** Authentication - auth - session / decoded Token: ${token}`);

          if (findRealUser.lastToken != token) {
            console.debug ("*** Authentication - auth - WARNING: Valid token but does not belongs to this user or expired");
          } else {
            // User was found and last token is same provided in the session token
            console.debug ("*** Authentication - auth - userId: " + userId + " userEmail: " + userEmail);
            console.debug ("*** Authentication - auth - token: " + token);

            console.debug ("*** Authentication - auth - Success... User is authorized");
    
            // Authorize user to move on in this request
            authResponse = {
              principalId: userId,
              policyDocument: {
                Version: '2012-10-17',
                Statement: [{
                    Effect: 'Allow',
                    Resource: `arn:aws:${service}:${region}:${accountId}:${apiId}/${stage}/*`,
                    Action: ['execute-api:Invoke'],
                  },],},}
          }
        } 
      };
    }

    console.debug ("*** Authentication - auth - Return finished with following policy: " + JSON.stringify(authResponse));
    return authResponse;

  } catch (err) {
    console.error('*** Authentication - auth - Error validating token / access');
    return {
      principalId: 'unknown',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Deny',
            Resource: '*',
            Action: [],
          },
        ],
      }
    };
  }
};
