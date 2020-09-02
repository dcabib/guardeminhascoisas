const jwt = require("jsonwebtoken");
const sanitizer = require("validator");

const DB = require("../../db");
const TableName = process.env.TABLENAME_USERS;

/**
 * Create & Sign a JWT with the user ID for request auth
 * @param str id
 */
module.exports.signToken = (id, email) =>
  jwt.sign({ id: id, email: email }, process.env.JWT_SECRET, {
    expiresIn: 24 * 60 * 60,
  }); // expire in 24 hours

/**
 * Does a given email exist as a user?
 * @param str email
 */
module.exports.userByEmail = (email) =>
  DB.scan({
    TableName,
    FilterExpression: "email = :email",
    ExpressionAttributeValues: {
      ":email": sanitizer.normalizeEmail(sanitizer.trim(email)),
    },
  })
    .promise()
    .then((res) => (res && res.Items && res.Items[0] ? res.Items[0] : null))
    .catch((err) => {
      console.error("Error at userByEmail");
      return null;
    });

/**
 * Get a user by ID
 * @param str id
 */
module.exports.userById = (id) => {
  console.debug("*** Helper - User - userById - started");
  console.debug("*** Helper - User - id: ", id);

  return DB.get({ TableName, Key: { id } })
    .promise()
    .then((res) => {
      // Return the user
      if (res && res.Item) {
        console.debug("*** Helper - User - User was found...");

        // We don't want the password shown to users
        if (res.Item.password) delete res.Item.password;

        return res.Item;
      } else {
        console.debug("*** Helper - User - User was not found");
      }
      // throw new Error('User not found');
    });
};

/**
 * Get a user by ID
 * @param str id
 */
module.exports.updateUser = (params) => {
  console.debug("*** Helper - User - updateUser - started");
  console.debug("*** Helper - User - params: ", JSON.stringify(params));

  try {
    
    return DB.update(params).promise()
    .then((user) => {
      if (!user) {
        console.debug("*** Helper - User - User was not found and was not updated");
        return null;
      } else {
        console.debug("*** Helper - User - User was found and updated...");
        return user;
      }
    });
  } catch (err) {
    console.debug("*** Helper - User - Error calling DB.update: " + JSON.stringify(err));
    return null;
  }
};
