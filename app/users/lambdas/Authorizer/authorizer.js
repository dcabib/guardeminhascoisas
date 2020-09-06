const jsonwebtoken = require('jsonwebtoken');

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

  let decodedToken;

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
// const jwt = require('jsonwebtoken');

// exports.auth =  function(event, context, callback) {
//   const token = event.authorizationToken;
//   try {
//     console.log ("***** INICIO");
//     console.log(token);
//     console.log(process.env.JWT_SECRET);
//     const user = jwt.verify(token, process.env.JWT_SECRET);
    
//     console.log ("***** ALLOW");

//     //if(!hasRequiredRole(user.roles)) throw "User does not have the required role to perform this action - " + user.id + " " + user.email;
//     callback(null, generatePolicy(user.id, 'Allow', event.methodArn, user));
//   } catch (er) {
//     console.error(er);
//     callback(null, generatePolicy(user.id, 'Deny', event.methodArn));
//   }
  
// };

// const generatePolicy = function(principalId, effect, resource, user) {
//   var authResponse = {};
  
//   authResponse.principalId = principalId;
//   if (effect && resource) {
//       var policyDocument = {};
//       policyDocument.Version = '2012-10-17'; 
//       policyDocument.Statement = [];
//       var statementOne = {};
//       statementOne.Action = 'execute-api:Invoke'; 
//       statementOne.Effect = effect;
//       statementOne.Resource = resource;
//       policyDocument.Statement[0] = statementOne;
//       authResponse.policyDocument = policyDocument;

//       console.log ("***** Policy:" + JSON.stringify(authResponse));

//   }
  
//   // Optional output with custom properties of the String, Number or Boolean type.
//   if(user) { 
//     authResponse.context = { user };
//     authResponse.principalId = user.id;
//   }

//   console.log ("***** user:" + JSON.stringify(user));

//   return authResponse;
// }

// const hasRequiredRole = function(userRoles) {
//   if(!process.env.ROLES) return true;
//   const roles = JSON.parse(process.env.ROLES);
//   for(var i in roles) {
//     if(userRoles.includes(roles[i].trim())) return true;
//   }
//   return false;
// }