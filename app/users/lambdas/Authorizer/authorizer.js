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
      console.debug (`*** Handler update - Getting lastToken from user: ${userId}.`);
      const findRealUser = await userById(userId); 

      if (!findRealUser || (findRealUser.lastToken != token)) {
        if (!findRealUser) { 
          console.debug ("*** Handler update - No previous token was found");
        } else {
          console.debug ("*** Handler update - lastToken: " + findRealUser.lastToken);
        }
        console.debug ("*** Handler update - token from header: " + token);

        console.debug ("*** Handler update - WARNING: Valid token but does not belongs to this user or expired");
        return authResponse;
      }

      console.debug ("*** Authentication - auth - userId: " + userId + " userEmail: " + userEmail);
      console.debug ("*** Authentication - auth - token: " + JSON.stringify(decodedToken));

      authResponse = {
        principalId: userId,
        policyDocument: {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Resource: `arn:aws:${service}:${region}:${accountId}:${apiId}/${stage}/*`,
              Action: ['execute-api:Invoke'],
            },
          ],
        },
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
