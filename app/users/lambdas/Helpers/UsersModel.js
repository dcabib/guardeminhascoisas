const jwt = require("jsonwebtoken");
const sanitizer = require("validator");

const DB = require("../../../../database/db");
const uuid = require('uuid');
const bcrypt = require ('bcryptjs');

const TableName = process.env.TABLENAME_USERS;

/**
 * Create & Sign a JWT with the user ID for request auth
 * @param str id
 */
module.exports.signToken = (id, email) => {
  return jwt.sign({ id: id, email: email }, process.env.JWT_SECRET, {expiresIn: 24 * 60 * 60,}); // expire in 24 hours
}

/**
 * Does a given email exist as a user?
 * @param str email
 */
module.exports.userByEmail = (email) => { 
  console.debug("###### Helper - User - userByEmail - started");
  console.debug("###### Helper - User - userByEmail - email: " + email);

  const params = {
    TableName,
    FilterExpression: "email = :email",
    ExpressionAttributeValues: {
      ":email": sanitizer.normalizeEmail(sanitizer.trim(email)),
  }};

  console.debug("###### Helper - User - userByEmail - params: " + JSON.stringify(params));

  return DB.scan(params)
    .promise()
    .then((res) => { 
      if (res && res.Items && res.Items[0]) {
        console.debug("###### Helper - User - userByEmail - user was found");
        return (res && res.Items && res.Items[0] ? res.Items[0] : null)
      }
      else {
        console.debug("###### Helper - User - userByEmail - user was not found");
        return null;
      }
    })
    .catch((err) => {
      console.debug("###### Helper - User - userByEmail - error:" + JSON.stringify(err));
      return null;
    });
}

/**
 * Get a user by ID
 * @param str id
 */
module.exports.userById = async (id) => {
  console.debug("###### Helper - User - userById - started");
  console.debug("###### Helper - User - id: ", id);

  return DB.get({ TableName, Key: { id } })
    .promise()
    .then((res) => {
      // Return the user
      if (res && res.Item) {
        console.debug("###### Helper - User - User was found...");

        // We don't want the password shown to users
        if (res.Item.password) 
          delete res.Item.password;

        return res.Item;
      } else {
        console.debug("###### Helper - User - User was not found");
        return null;
      }
      // throw new Error('User not found');
    })
    .catch((err) => {
      console.debug("###### Helper - User - userById - error:" + JSON.stringify(err));
      return null;
    });
};

/**
 * Add a user into DB
 * @param str id
 */
module.exports.addUser = async (firstName, lastName, email, password) => {
  console.debug("###### Helper - User - addUser - started");
  console.debug(`###### Helper - User - addUser - firstName: ${firstName}, lastName: ${lastName}, email: ${email}, ${lastName}, password: ${password}`);

  const id = await uuid.v4();

  if (!email || !password) {
    console.debug ("###### Helper - User - addUser - missing mandatory parameters (email or password) to add user");
    return null;
  }
  
  const Item = {
    id: id,
    firstName: sanitizer.trim(firstName),
    lastName: sanitizer.trim(lastName),
    email: sanitizer.normalizeEmail(sanitizer.trim(email)),
    password: await bcrypt.hashSync(password, 8),
    level: 'standard',
    createdAt: new Date().getTime(),
    updatedAt: new Date().getTime(),
  };

  const params = {
    TableName,
    Item,
  };

  console.debug ("###### Helper - User - addUser - Adding user to DB with params: " + JSON.stringify(params));

  return await DB.put(params)
    .promise()
    .then(data => {
      if (data) {
        console.debug("###### Helper - User - addUser - User was created successfully.");
        return Item;
      } else {
        console.debug("###### Helper - User - addUser - User was not created");
        return null;
      }
    })
    .then((data) => {
      console.debug ("###### Helper - User - addUser - Data returned from DB.put(): " + JSON.stringify(data));
      console.debug("###### Helper - User - addUser - Getting user details with id: " + id);
      return this.userById(data.id);
    })
    .then(user => {
      console.debug("###### Helper - User - addUser - User information: " + JSON.stringify(user));
      return user;
    })
    .catch (err => {
      console.debug("###### Helper - User - addUser - Error adding user: " + JSON.stringify(err));
      return null;
    });
};

/**
 * Get a user by ID
 * @param str id
 */
module.exports.updateUser = (data) => {
  console.debug("###### Helper - User - updateUser - started");
  console.debug("###### Helper - User - updateUser - data received: ", JSON.stringify(data));

  const params = {
    TableName,
    Key: {"id": data.id},
    UpdateExpression: data.UpdateExpression,
    ExpressionAttributeValues: data.ExpressionAttributeValues,
  };

  console.debug("###### Helper - User - updateUser - params to update: ", JSON.stringify(params));

  try {
    return DB.update(params).promise()
    .then(user => {
      if (!user) {
        console.debug("###### Helper - User - updateUser - User was not found and was not updated");
        return null;
      } else {
        console.debug("###### Helper - User - updateUser - User was found and updated...");
        return user;
      }
    });
  } catch (err) {
    console.debug("###### Helper - User - updateUser - Error calling DB.update: " + JSON.stringify(err));
    return null;
  }
};

/**
 * Delete a user by ID
 * @param str id
 */
module.exports.deleteUsers = (params) => {
  console.debug("###### Helper - User - deleteUsers - started");
  console.debug("###### Helper - User - deleteUsers - params: ", JSON.stringify(params));

  try {
    
    return DB.delete(params).promise()
    .then((user) => {
      if (!user) {
        console.debug("###### Helper - User - deleteUsers - User was not found and was not updated");
        return null;
      } else {
        console.debug("###### Helper - User - deleteUsers - User was found and updated...");
        return user;
      }
    });
  } catch (err) {
    console.debug("###### Helper - User - Error calling DB.update: " + JSON.stringify(err));
    return null;
  }
};