const jwt = require('jsonwebtoken');
const DB = require('../../../database/db');

// Unit Tests
const { signToken, userByEmail, userById, addUser } = require('../../../app/users/lambdas/Helpers/UsersModel');
// const login  = require('../../../app/users/lambdas/login/login');
// const register  = require('../../../app/users/lambdas/register/register');

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

  it('should generate token + when decoded, should be equal to input User ID', async () => {
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
  it('should load correct user', async () => {
    // Mock a single user DB response
    DB.scan = jest.fn(() => ({
      promise: () => new Promise(resolve => resolve({ Items: [mockExitingUserData] })),
    }));

    const res = await userByEmail(mockExitingUserData.email);
    expect(res).toBeDefined();
    expect(res.email).toEqual(mockExitingUserData.email);
  });

  it('should return null when not found in DB', async () => {
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
  it('should load correct user', async () => {
    // Mock a single user DB response
    DB.get = jest.fn(() => ({
      promise: () => new Promise(resolve => resolve({ Item: mockExitingUserData })),
    }));

    const res = await userById(mockExitingUserData.id);

    // Should have data
    expect(res).toBeDefined();
    expect(res.id).toEqual(mockExitingUserData.id);

    // Password shouldn't be in response
    expect(res.password).toBeUndefined();
  });

  it('should throw an error when not found in DB', async () => {
    // Mock an empty DB response
    DB.get = jest.fn(() => ({ promise: () => new Promise(resolve => resolve({})) }));

    const res = await userById(11111111111111);

    // Should have data
    expect(res).toBeNull();
  });
});

// /**
//  * Tests for addUser()
//  */
describe('Adding User', () => {
  beforeEach(() => { jest.resetModules(); process.env = { JWT_SECRET: '123Abc123' }; });
  
  it('should add user', async () => {
    // Mock a single user DB response
    DB.put = jest.fn(() => ({
        promise: () => new Promise(resolve => resolve({ Items: [mockNewUserData]} )),
    }));

    DB.get = jest.fn(() => ({
      promise: () => new Promise(resolve => resolve({ Item: {...mockNewUserData} })),
    }));

    const res = await addUser(mockNewUserData.firstName, mockNewUserData.lastName, mockNewUserData.email, mockNewUserData.password);

    // Should have data
    expect(res).toBeDefined();
    expect(res.id).toEqual(mockNewUserData.id);
    expect(res.firstName).toEqual(mockNewUserData.firstName);
    expect(res.lastName).toEqual(mockNewUserData.lastName);
    expect(res.email).toEqual(mockNewUserData.email);

    // Password shouldn't be in response
    expect(res.password).toBeUndefined();
  });

 it('should should not add user - missing email', async () => {
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

  it('should should not add user - missing password', async () => {
    // Mock a single user DB response
    DB.get = jest.fn(() => ({
      promise: () => new Promise(resolve => resolve({ Item: mockExitingUserData })),
    }));
  
    const res = await addUser(mockExitingUserData.firstName, mockExitingUserData.lastName, mockExitingUserData.email);
  
    // Shouldn't have data
    expect(res).toBeNull();
  });

});

