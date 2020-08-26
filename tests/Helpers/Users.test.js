const jwt = require('jsonwebtoken');
const DB = require('../../db');

// Unit Tests
const { signToken, userByEmail, userById } = require('../../app/Helpers/Users');
const  { register, login }  = require('../../app/Handlers/Users');

// Funcitonal / Integation Test
// // cost { rwegister } = require ('../../app/Handlers/Users/Users')
// const { ServerlessLocal } = require ('../eventGenator');
// const valitors = require ('../validators');
// // const assert = require('chai').assert;
// const databaseManager = require('../../databasemanager');
// var AWS = require('aws-sdk');

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

// const mockNewUserData = {
//   id: '03969310-b0e1-11e8-a48b-efa31124d46c',
//   firstName: 'John',
//   lastName: 'Doe',
//   email: 'john@doe.com',
//   password: '$2a$08$cL0mUj5pDcZ5T5lkkzFFn.joE.ai7Z5KSXBvc5O2OjzNkAKUs5rim',
//   level: 'standard',
//   createdAt: 1536134110955,
//   updatedAt: 1536134110955
// };

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

    await expect(userById(123)).rejects.toThrow('User not found');
  });
});

// beforeAll(() => {
//   console.log("Before all");
//   const dynamo = new AWS.DynamoDB.DocumentClient({
//     region: 'localhost',
//     endpoint: 'http://localhost:8000'
//   });

//   databaseManager.initializateDynamoClient(dynamo);
//   console.log("Before all -  end");

// });

// afterAll(() => {
//   console.log("After all");

//   const dynamo = new AWS.DynamoDB.DocumentClient();
//   databaseManager.initializateDynamoClient(dynamo);
// });

// /**
//  * Functional Test - for User / Handler.register
//  */
// describe('Create a user as a integration test', () => {
//   it('should create a user', async () => {

//     const event = ServerlessLocal ({
//       body : {
//           firstName: "Eduardo",
//           lastName: "Cintra",
//           email: "eduardo@abib.com",
//           password: "outrasenha",
//       }
//     });

//     process.env.IS_OFFLINE = { region: 'localhost', endpoint: 'http://localhost:8000' };

//   //   const event = eventGenerator({
//   //     body: {
//   //         name: 'tom',
//   //         score: 43,
//   //     },
//   // });

//     cb = function (status, value) {
//       console.log ("Passei pelo callback");
//       console.log(value);

//       const res = await login (event)
//     };

//     //console.log ("Event: " + JSON.stringify(event));

//     const res = await register (event, null, cb);

//     // Should have data
//     console.log ("Result of register: " + res);

//     // expect(res).toBe();
//     // expect(valitors.isApiGatewayResponse(res)).toBe(true);
//   });

//   it('should throw an error when not found in DB', async () => {
//     // Mock an empty DB response
//     DB.get = jest.fn(() => ({ promise: () => new Promise(resolve => resolve({})) }));

//     await expect(userById(123)).rejects.toThrow('User not found');
//   });
// });


