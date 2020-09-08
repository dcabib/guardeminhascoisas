
const middy = require('middy');
const sanitizer = require('validator');
const { jsonBodyParser } = require('middy/middlewares');
const apiResponseMiddleware = require('../../../Middleware/ApiResponse');

const { userById, signToken, updateUser } = require('../Helpers/UsersModel');

/**
 * POST /user/refreshToken  ----------------------------------------------------
 * Renew / Refresh a user's token in - returns a JWT token
 * @param event
 * @param context
 * @param cb
 */
const handler = async (event, context, cb) => {
    console.debug ("*** Handler refreshToken - started");

    const userId = event.requestContext.authorizer.principalId;
    console.debug ("*** Handler refreshToken - id: " + userId);
  
    try {
        return userById(userId) // Check if the user exists (of course exists)
        .then((foundUser) => {
            if (!foundUser) {
                console.debug ("*** Handler refreshToken - user was not found");
                return cb(null, {statusCode: 404, message: 'User with this token / credentials was not found'});
            }

            // Generating a authentication token
            const genToken = signToken(foundUser.id, foundUser.email);
            console.debug ("*** Handler refreshToken - Token was generated: " + genToken);

            // Updating user / token informatio on DB 
            console.debug ("*** Handler refreshToken - updating token to this user: " + JSON.stringify(foundUser.id)); 

            const params = {
                id: foundUser.id,
                UpdateExpression: 'set lastToken = :lt',
                ExpressionAttributeValues: {':lt': sanitizer.trim(genToken)},
            };
            
            console.debug ("*** Handler refreshToken - updating user information to add token ");

            return updateUser(params) // Check if the new email already exists
                .then(user => {
                if (user) {
                    console.debug ("*** Handler refreshToken - Return was successful - user information was updated");
                    cb(null, {statusCode: 200, message: 'Success - you have a new token', data: { token: genToken }})
                } else {
                    console.debug ("*** Handler refreshToken - Error updating user informnatin" + JSON.stringify(err));
                    cb(null, {statusCode: err.statusCode, message: 'Internal Server error while updating user:' + JSON.stringify(err)});
                }
            });
        });
    } 
    catch (err) {
        console.error ("Handler refreshToken - Internal server error while getting user info..." + JSON.stringify(err));
        cb(null, { statusCode: err.statusCode, message: 'Handler user - Internal Server error: ' + JSON.stringify(err)});
    }
}
  
module.exports.handler = middy(handler)
.use(apiResponseMiddleware());
  