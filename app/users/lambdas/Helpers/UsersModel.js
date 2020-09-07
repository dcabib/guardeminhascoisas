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

  if (!email) {
    console.debug("###### Helper - User - userByEmail - missing required parameters: email");
    return null;
  }

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

  if (!id) {
    console.debug("###### Helper - User - userById - missing required parameters: id");
    return null;
  }

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
        delete Item.password;
        return Item;
      } else {
        console.debug("###### Helper - User - addUser - User was not created");
        return null;
      }
    })
    // .then((data) => {
    //   console.debug ("###### Helper - User - addUser - Data returned from DB.put(): " + JSON.stringify(data));
    //   console.debug("###### Helper - User - addUser - Getting user details with id: " + id);
    //   return Item;
    // })
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

  if (!data || !data.id || !data.UpdateExpression || !data.ExpressionAttributeValues) {
    console.debug("###### Helper - User - updateUser - Error: missing mandatory parameters");
    return null;
  }

  const params = {
    TableName,
    Key: {"id": data.id},
    UpdateExpression: data.UpdateExpression,
    ExpressionAttributeValues: data.ExpressionAttributeValues,
    ReturnValues: 'ALL_NEW',
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
        return (user);
      }
    });
  } catch (err) {
    console.debug("###### Helper - User - updateUser - Error calling DB.update: " + JSON.stringify(err));
    return null;
  }
};

module.exports.createParamsforUpdate = async(id, firstName, lastName, email, password) => {
  console.debug ("*** Handler update - createParams - stating");

  let query = '';
  let queryValues = {};

  // Create update query based on user input
  // Check whitch values to change in used database
  if (firstName) {
    console.debug ("*** Handler update - createParams - updating firstName");
    query += 'set firstName=:fn, '; queryValues[':fn'] = sanitizer.trim(firstName) 
  }

  if (lastName) {
    console.debug ("*** Handler update - createParams - updating lastName");
    if (query === '') 
        query+= 'set ';
    query+= 'lastName=:ln, ';
    queryValues[':ln'] = sanitizer.trim(lastName);
  }
  
  if (email) {
    console.debug ("*** Handler update - createParams - updating email");

    if (query === '') 
      query+= 'set ';
    query+= 'email=:em, ';
    queryValues[':em'] = sanitizer.normalizeEmail(sanitizer.trim(email))
  }
  
  console.debug ("*** Handler update - createParams - updating updatedAt");
  // Mandatory update
  if (query === '') 
    query+= 'set ';
  query += 'updatedAt=:ud';
  queryValues[':ud'] = new Date().getTime();

  // Password is optional, if provided, pass to query
  if (password) 
  {
    console.debug ("*** Handler update - User has choosen to update password");
    query += ', password=:pw';
    queryValues[':pw'] = await bcrypt.hash(password, 8);
  }
  const retParams = {
    id : id,
    UpdateExpression: query,
    ExpressionAttributeValues: queryValues,
  };

  console.debug ("*** Handler update - Returning params to update user: " + JSON.stringify(retParams));

 return retParams;
}

/**
 * Delete a user by ID
 * @param str id
 */
module.exports.deleteUsers = (userId) => {
  console.debug("###### Helper - User - deleteUsers - started");
  console.debug("###### Helper - User - deleteUsers - Deleting user with id: " + userId);

  if (!userId) {
    console.debug("###### Helper - User - deleteUsers - Error: missing mandatory parameters: userId");
    return null;
  }

  try {
    const params = {
        TableName, 
        Key: { id: userId },
        ReturnValues: 'ALL_OLD'
    };
    
    return DB.delete(params).promise()
    .then((user) => {
      if (!user) {
        console.debug("###### Helper - User - deleteUsers - User was not found and was not updated");
        return null;
      } else {
        console.debug("###### Helper - User - deleteUsers - User was found deleted ...");
        return user.Items[0];
      }
    });
  } catch (err) {
    console.debug("###### Helper - User - Error calling DB.update: " + JSON.stringify(err));
    return null;
  }
};