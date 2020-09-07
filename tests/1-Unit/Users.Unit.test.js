const jwt = require('jsonwebtoken');
const DB = require('../../database/db');

// Unit Tests
const { signToken, userByEmail, userById, addUser, updateUser, createParamsforUpdate, deleteUsers } = require('../../app/users/lambdas/Helpers/UsersModel');

const mockExitingUserData = {
  id: '03969310-b0e1-11e8-a48b-efa31124d46c',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@doe.com',
  password: '$2a$08$cL0mUj5pDcZ5T5lkkzFFn.joE.ai7Z5KSXBvc5O2OjzNkAKUs5rim',
  level: 'standard',
  createdAt: 1536134110955,
  updatedAt: 1536134110955
};

const mockNewUserData = {
  id: '40701115-4636-408e-b6be-08052d8c00dd',
  firstName: 'Eduardo',
  lastName: 'Abib',
  email: 'eduardo@abib.com',
  password: '$2a$08$cL0mUj5pDcZ5T5lkkzFFn.joE.ai7Z5KSXBvc5O2OjzNkAKUs5rim',
  level: 'standard',
  createdAt: 1599340453080,
  updatedAt: 1599340453080
};

/**
 * Tests for signToken()
 */
describe('JWT Tokens', () => {
  beforeEach(() => { jest.resetModules(); process.env = { JWT_SECRET: '123Abc123' }; });

  it('Should generate token + when decoded, Should be equal to input User ID', async () => {
    const userId = '464b5e40-b2fb-11e8-89b6-b5c77595a2ec';
    const token = await signToken(userId);

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      expect(decoded.id).toEqual(userId);
    });
  });
});

/**
 * Tests for userByEmail()
 */
describe('User lookup by email', () => {
  it('Should load correct user', async () => {
    // Mock a single user DB response
    DB.scan = jest.fn(() => ({
      promise: () => new Promise(resolve => resolve({ Items: [mockExitingUserData] })),
    }));

    const res = await userByEmail(mockExitingUserData.email);
    expect(res).toBeDefined();
    expect(res.email).toEqual(mockExitingUserData.email);
  });

  it('Should return null when email was not provided', async () => {
    // Mock an empty DB response
    DB.scan = jest.fn(() => ({ promise: () => new Promise(resolve => resolve({})) }));

    const res = await userByEmail();
    expect(res).toBeNull();
  });

  it('Should return null when user not found in DB', async () => {
    // Mock an empty DB response
    DB.scan = jest.fn(() => ({ promise: () => new Promise(resolve => resolve({})) }));

    const res = await userByEmail('something@else.com');
    expect(res).toBeNull();
  });
});

/**
 * Tests for userById()
 */
describe('User lookup by ID', () => {
  it('Should load correct user by ID', async () => {
    // Mock a single user DB response
    DB.get = jest.fn(() => ({
      promise: () => new Promise(resolve => resolve({ Item: {...mockNewUserData} })),
    }));

    const res = await userById(mockExitingUserData.id);

    // Should have data
    expect(res).toBeDefined();
    expect(res.id).toEqual(mockNewUserData.id);

    // Password Shouldn't be in response
    expect(res.password).toBeUndefined();
  });

  it('Should return null when user was not found in DB', async () => {
    // Mock an empty DB response
    DB.get = jest.fn(() => ({ promise: () => new Promise(resolve => resolve({})) }));

    const res = await userById();
    // Should not have data
    expect(res).toBeNull();
  });

  it('Should return null when user was not found in DB', async () => {
    // Mock an empty DB response
    DB.get = jest.fn(() => ({ promise: () => new Promise(resolve => resolve({})) }));

    const res = await userById(11111111111111);

    // Should not have data
    expect(res).toBeNull();
  });

});

/**
 * Tests for addUser()
 */
describe('Adding User', () => {
  beforeEach(() => { jest.resetModules(); process.env = { JWT_SECRET: '123Abc123' }; });
  
  it('Should add user', async () => {
    // Mock a single user DB response
    DB.put = jest.fn(() => ({
      promise: () => new Promise(resolve => resolve({}))
    }));

    DB.get = jest.fn(() => ({
      promise: () => new Promise(resolve => resolve({ Item: {...mockNewUserData} })),
    }));

    const res = await addUser(mockNewUserData.firstName, mockNewUserData.lastName, mockNewUserData.email, mockNewUserData.password);

    console.log (res);

    // Should have data
    expect(res).toBeDefined();
    expect(res.id).toBeDefined();
    expect(res.firstName).toEqual(mockNewUserData.firstName);
    expect(res.lastName).toEqual(mockNewUserData.lastName);
    expect(res.email).toEqual(mockNewUserData.email);

    // Password Shouldn't be in response
    expect(res.password).toBeUndefined();
  });

 it('Should Should not add user - missing email', async () => {
    // Mock a single user DB response
    DB.put = jest.fn(() => ({
      promise: () => new Promise(resolve => resolve({ Items: [mockExitingUserData]} )),
    }));

    DB.get = jest.fn(() => ({
      promise: () => new Promise(resolve => resolve({ Item: {...mockNewUserData} })),
    }));

    const res = await addUser(mockExitingUserData.firstName, mockExitingUserData.lastName, null, mockExitingUserData.password);

    // Shouldn't have data
    expect(res).toBeNull();
  });

  it('Should Should not add user - missing password', async () => {
    // Mock a single user DB response
    DB.get = jest.fn(() => ({
      promise: () => new Promise(resolve => resolve({ Item: mockExitingUserData })),
    }));
  
    const res = await addUser(mockExitingUserData.firstName, mockExitingUserData.lastName, mockExitingUserData.email);
  
    // Shouldn't have data
    expect(res).toBeNull();
  });
});

/**
 * Tests for update()
 */
describe('Update User and support methods', () => {
  beforeEach(() => { jest.resetModules(); process.env = { JWT_SECRET: '123Abc123' }; });
  
  it('Should get all update parameters to update user', async () => {
    const res = await createParamsforUpdate (mockNewUserData.id, mockNewUserData.firstName, mockNewUserData.lastName, mockNewUserData.email, mockNewUserData.password)

    // Should have data
    expect(res).toBeDefined();
    expect(res.id).toEqual(mockNewUserData.id);
    expect(res.UpdateExpression).toEqual('set firstName=:fn, lastName=:ln, email=:em, updatedAt=:ud, password=:pw');
    expect(res.ExpressionAttributeValues).toHaveProperty(':fn');
    expect(res.ExpressionAttributeValues).toHaveProperty(':ln');
    expect(res.ExpressionAttributeValues).toHaveProperty(':em');
    expect(res.ExpressionAttributeValues).toHaveProperty(':ud');
  });

  it('Should get all update parameters apart of fistName to update user', async () => {
    const res = await createParamsforUpdate (mockNewUserData.id, null, mockNewUserData.lastName, mockNewUserData.email, mockNewUserData.password)

    // Should have data
    expect(res).toBeDefined();
    expect(res.id).toEqual(mockNewUserData.id);
    expect(res.UpdateExpression).toEqual('set lastName=:ln, email=:em, updatedAt=:ud, password=:pw');
    expect(res.ExpressionAttributeValues).not.toHaveProperty(':fn');
    expect(res.ExpressionAttributeValues).toHaveProperty(':ln');
    expect(res.ExpressionAttributeValues).toHaveProperty(':em');
    expect(res.ExpressionAttributeValues).toHaveProperty(':pw');
    expect(res.ExpressionAttributeValues).toHaveProperty(':ud');
  });

  it('Should get all update parameters apart of lastName to update user', async () => {
    const res = await createParamsforUpdate (mockNewUserData.id, mockNewUserData.firstName, null, mockNewUserData.email, mockNewUserData.password)

    // Should have data
    expect(res).toBeDefined();
    expect(res.id).toEqual(mockNewUserData.id);
    expect(res.UpdateExpression).toEqual('set firstName=:fn, email=:em, updatedAt=:ud, password=:pw');
    expect(res.ExpressionAttributeValues).toHaveProperty(':fn');
    expect(res.ExpressionAttributeValues).not.toHaveProperty(':ln');
    expect(res.ExpressionAttributeValues).toHaveProperty(':em');
    expect(res.ExpressionAttributeValues).toHaveProperty(':pw');
    expect(res.ExpressionAttributeValues).toHaveProperty(':ud');
  });

  it('Should get all update parameters apart of email to update user', async () => {
    const res = await createParamsforUpdate (mockNewUserData.id, mockNewUserData.firstName, mockNewUserData.lastName, null, mockNewUserData.password)

    // Should have data
    expect(res).toBeDefined();
    expect(res.id).toEqual(mockNewUserData.id);
    expect(res.UpdateExpression).toEqual('set firstName=:fn, lastName=:ln, updatedAt=:ud, password=:pw');
    expect(res.ExpressionAttributeValues).toHaveProperty(':fn');
    expect(res.ExpressionAttributeValues).toHaveProperty(':ln');
    expect(res.ExpressionAttributeValues).not.toHaveProperty(':em');
    expect(res.ExpressionAttributeValues).toHaveProperty(':pw');
    expect(res.ExpressionAttributeValues).toHaveProperty(':ud');
  });

  it('Should get all update parameters apart of password to update user', async () => {
    const res = await createParamsforUpdate (mockNewUserData.id, mockNewUserData.firstName, mockNewUserData.lastName, mockNewUserData.email)

    // Should have data
    expect(res).toBeDefined();
    expect(res.id).toEqual(mockNewUserData.id);
    expect(res.UpdateExpression).toEqual('set firstName=:fn, lastName=:ln, email=:em, updatedAt=:ud');
    expect(res.ExpressionAttributeValues).toHaveProperty(':fn');
    expect(res.ExpressionAttributeValues).toHaveProperty(':ln');
    expect(res.ExpressionAttributeValues).toHaveProperty(':em');
    expect(res.ExpressionAttributeValues).not.toHaveProperty(':pw');
    expect(res.ExpressionAttributeValues).toHaveProperty(':ud');
  });

  it('Should get all update parameters apart of email password to update user', async () => {
    const res = await createParamsforUpdate (mockNewUserData.id, mockNewUserData.firstName, mockNewUserData.lastName)

    // Should have data
    expect(res).toBeDefined();
    expect(res.id).toEqual(mockNewUserData.id);
    expect(res.UpdateExpression).toEqual('set firstName=:fn, lastName=:ln, updatedAt=:ud');
    expect(res.ExpressionAttributeValues).toHaveProperty(':fn');
    expect(res.ExpressionAttributeValues).toHaveProperty(':ln');
    expect(res.ExpressionAttributeValues).not.toHaveProperty(':em');
    expect(res.ExpressionAttributeValues).not.toHaveProperty(':pw');
    expect(res.ExpressionAttributeValues).toHaveProperty(':ud');
  });

  it('Should update user', async () => {
    // Mock a single user DB response
    DB.update = jest.fn(() => ({
        promise: () => new Promise(resolve => resolve({ ...mockNewUserData} )),
    }));

    const params = await createParamsforUpdate (mockNewUserData.id, mockNewUserData.firstName, mockNewUserData.lastName, mockNewUserData.email, mockNewUserData.password)
    const res = await updateUser(params);

    console.log (res);

    // Should have data
    expect(res).toBeDefined();
    expect(res.id).toEqual(mockNewUserData.id);
    expect(res.firstName).toEqual(mockNewUserData.firstName);
    expect(res.lastName).toEqual(mockNewUserData.lastName);
    expect(res.email).toEqual(mockNewUserData.email);
    expect(res.password).toEqual(mockNewUserData.password);
    expect(res.createdAt).toBeDefined();
    expect(res.updatedAt).toBeDefined();
  });

  it('Should not update user - missing mandatory parameters - id', async () => {
    // Mock a single user DB response
    DB.update = jest.fn(() => ({
        promise: () => new Promise(resolve => resolve({ Items: [mockNewUserData]} )),
    }));

    const params = await createParamsforUpdate (mockNewUserData.id, mockNewUserData.firstName, mockNewUserData.lastName, mockNewUserData.email, mockNewUserData.password);
    delete params['id'];
    const res = await updateUser(params);

    // Should have data
    expect(res).toBeNull();
  });

  it('Should not update user - missing mandatory parameters - UpdateExpression', async () => {
    // Mock a single user DB response
    DB.update = jest.fn(() => ({
        promise: () => new Promise(resolve => resolve({ Items: [mockNewUserData]} )),
    }));

    const params = await createParamsforUpdate (mockNewUserData.id, mockNewUserData.firstName, mockNewUserData.lastName, mockNewUserData.email, mockNewUserData.password);
    delete params['UpdateExpression'];
    const res = await updateUser(params);

    // Should have data
    expect(res).toBeNull();
  });

  it('Should not update user - missing mandatory parameters - ExpressionAttributeValues', async () => {
    // Mock a single user DB response
    DB.update = jest.fn(() => ({
        promise: () => new Promise(resolve => resolve({ Items: [mockNewUserData]} )),
    }));

    const params = await createParamsforUpdate (mockNewUserData.id, mockNewUserData.firstName, mockNewUserData.lastName, mockNewUserData.email, mockNewUserData.password);
    delete params['ExpressionAttributeValues'];
    const res = await updateUser(params);

    // Should have data
    expect(res).toBeNull();
    });
});

/**
 * Tests User Deletion
 */
describe('User for delete', () => {
  it('Should delete a user', async () => {
    // Mock a single user DB response
    DB.delete = jest.fn(() => ({
      promise: () => new Promise(resolve => resolve({ Items: [mockExitingUserData] })),
    }));

    const res = await deleteUsers(mockExitingUserData.id);
    expect(res.Items[0]).toBeDefined();
    expect(res.Items[0].id).toEqual(mockExitingUserData.id);
    expect(res.Items[0].email).toEqual(mockExitingUserData.email);
  });

  it('Should return null when id was not provided', async () => {
    // Mock an empty DB response
    const res = await deleteUsers();
    expect(res).toBeNull();
  });

});
