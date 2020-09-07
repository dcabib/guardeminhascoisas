const jwt = require('jsonwebtoken');
const DB = require('../../../database/db');

// // Unit Tests
const { signToken } = require('../../../app/users/lambdas/Helpers/UsersModel');
const { auth } = require('../../../app/users/lambdas/Authorizer/authorizer');
// const register  = require ("../../../app/users/lambdas/register/register");
// const login = require('../../../app/users/lambdas/login/login');
const get = require('../../../app/users/lambdas/get/get');
// const update = require('../../../app/users/lambdas/update/update');
// const deleteUser = require('../../../app/users/lambdas/delete/delete');

// let userToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImMxOWEwZGMzLTU0YmYtNDc2OS05MmZiLTRlYTk1YzJlNzVlOSIsImVtYWlsIjoiZGFuaWVsMUBhYmliLmNvbSIsImlhdCI6MTU5OTQzODQ4MywiZXhwIjoxNTk5NTI0ODgzfQ.gw1GZxtnoQhhBuy93-t0e_LmmIeAo-w3oUS1Z4_uXHc';
let userAuthorizer;

const mockExitingUserData = {
    id: '03969310-b0e1-11e8-a48b-efa31124d46c',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@doe.com',
    password: '$2a$08$lB78PM0iFe5XK7jVuqIwlOGgcBkhtnkmSuqRTxwmuzXg.RoM/4cDy',
    level: 'standard',
    createdAt: 1536134110955,
    updatedAt: 1536134110955
};

const mockNewUserData = {
    id: 'd5416a71-84d5-48a8-b904-539d51bc1ce1',
    firstName: 'Eduardo',
    lastName: 'Abib',
    email: 'eduardo@abib.com',
    password: '$2a$08$aR5ivoOTmR7EbHI0VljXc.euzUHNBuXfKW/LFHg805dVD9Jp7hXIK',
    level: 'standard',
    lastToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImQ1NDE2YTcxLTg0ZDUtNDhhOC1iOTA0LTUzOWQ1MWJjMWNlMSIsImVtYWlsIjoiZWR1YXJkb0BhYmliLmNvbSIsImlhdCI6MTU5OTQ0NTUyNSwiZXhwIjoxNTk5NTMxOTI1fQ.zxwFkoqDmki8azgQkhmkAGhcIWCtVFXbpVQchG-6K1s',
    createdAt: 1599340453080,
    updatedAt: 1599340453080
  };

const mockUpdatedUserData = {
    firstName: 'UpdatedFirstName',
    lastName: 'UpdatedLastName',
    email: mockNewUserData.email
}

const newUserAuth = {
    email: mockNewUserData.email,
    password: 'abc1234rfd'
}

/**
 * Tests for register()
 */
// describe('Register', () => {
//     beforeEach(() => { jest.resetModules(); process.env = { JWT_SECRET: '123Abc123' }; });

//     it('Register with valid data', async done => {
//         // Mock DB response
//         DB.scan = jest.fn(() => ({
//             promise: () => new Promise(reject => resolve({ Item: {...mockNewUserData} })),
//         }));
//         DB.put = jest.fn(() => ({
//             promise: () => new Promise(resolve => resolve({ Items: [mockNewUserData]} )),
//         }));
//         DB.get = jest.fn(() => ({
//             promise: () => new Promise(resolve => resolve({ mockNewUserData })),
//         }));

//         DB.add = jest.fn(() => ({
//             promise: () => new Promise(resolve => resolve({ Item: {...mockNewUserData} })),
//         }));
        
//         let event = {
//             "body": {
//                 "firstName": mockNewUserData.firstName,
//                 "lastName": mockNewUserData.lastName,
//                 "email": mockNewUserData.email,
//                 "password": newUserAuth.password
//             },
//         };

//         register.handler(event, null, (error, data) => {
//             try {
//                 expect(data.statusCode).toBe(201);
//                 let responseBody = JSON.parse(data.body)
//                 expect(responseBody.data.firstName).toBe(mockNewUserData.firstName);
//                 expect(responseBody.data.lastName).toBe(mockNewUserData.lastName);
//                 expect(responseBody.data.email).toBe(mockNewUserData.email);
//                 done();
//             } catch (error) {
//                 done(error);
//             }
//         });
//     });

//     it('Register without firstname(error scenario)', async done => {
//         let event = {
//             "body": {
//                 "lastName": mockNewUserData.lastName,
//                 "email": mockNewUserData.email,
//                 "password": newUserAuth.password
//             },
//         };

//         register.handler(event, null, (error, data) => {
//             try {
//                 expect(data.statusCode).toBe(422);
//                 let responseBody = JSON.parse(data.body)
//                 expect(responseBody.data[0].params.missingProperty).toBe('firstName');
//                 done();
//             } catch (error) {
//                 done(error);
//             }
//         });
//     });

//     it('Register without lastname(error scenario)', async done => {
//         let event = {
//             "body": {
//                 "firstName": mockNewUserData.firstName,
//                 "email": mockNewUserData.email,
//                 "password": newUserAuth.password
//             },
//         };

//         register.handler(event, null, (error, data) => {
//             try {
//                 expect(data.statusCode).toBe(422);
//                 let responseBody = JSON.parse(data.body)
//                 expect(responseBody.data[0].params.missingProperty).toBe('lastName');
//                 done();
//             } catch (error) {
//                 done(error);
//             }
//         });
//     });

//     it('Register without email(error scenario)', async done => {
//         let event = {
//             "body": {
//                 "firstName": mockNewUserData.firstName,
//                 "lastName": mockNewUserData.lastName,
//                 "password": newUserAuth.password
//             },
//         };

//         register.handler(event, null, (error, data) => {
//             try {
//                 expect(data.statusCode).toBe(422);
//                 let responseBody = JSON.parse(data.body)
//                 expect(responseBody.data[0].params.missingProperty).toBe('email');
//                 done();
//             } catch (error) {
//                 done(error);
//             }
//         });
//     });

//     it('Register invalid JSON(error scenario)', async done => {
//         let event = {
//             "headers": {
//                 "Content-Type": "application/json",
//             },
//             "body": '{"firstname":"fname", "lastName"="lname"}',
//         };

//         register.handler(event, null, (error, data) => {
//             try {
//                 if (error)
//                     expect(error).toBeDefined();
//                 else 
//                     expect(data.statusCode).toBe(500);
//                 done();
//             } catch (error) {
//                 done(error);
//             }
//         });
//     });
// });


// /**
//  * Tests for login()
//  */
// describe('Login', () => {
//     beforeEach(() => { jest.resetModules(); process.env = { JWT_SECRET: 'JWT_SECRET=123Abc789XYZ' }; });

//     it('Login with valid data', async done => {
//         // Mock DB response
//         DB.scan = jest.fn(() => ({
//             promise: () => new Promise(resolve => resolve({ Items: [{...mockNewUserData}] })),
//         }));

//         mockNewUserData.lastToken = signToken(mockNewUserData.id, mockNewUserData.email);
//         DB.update = jest.fn(() => ({
//             promise: () => new Promise(resolve => resolve({ Attributes: {lastToken: mockNewUserData.lastToken} })),
//         }));

//         let event = {
//             "body": {...newUserAuth},
//         };

//         login.handler(event, null, (error, data) => {
//             console.log('login response', JSON.stringify(data));
//             try {
//                 console.log (data);
//                 expect(data.statusCode).toBe(200);
//                 let responseBody = JSON.parse(data.body)
//                 expect(responseBody.data.token).toBe(mockNewUserData.lastToken);
//                 userToken = mockNewUserData.lastToken;
//                 done();
//             } catch (error) {
//                 done(error);
//             }

//         });
//     });

//     it('Login without email(error scenario)', async done => {
//         let event = {
//             "body": {
//                 password: newUserAuth.password
//             },
//         };

//         login.handler(event, null, (error, data) => {
//             console.log('login response', JSON.stringify(data));
//             try {
//                 expect(data.statusCode).toBe(422);
//                 let responseBody = JSON.parse(data.body)
//                 expect(responseBody.data[0].params.missingProperty).toBe('email');
//                 done();
//             } catch (error) {
//                 done(error);
//             }

//         });
//     });

//     it('Login without password(error scenario)', async done => {
//         let event = {
//             "body": {
//                 email: newUserAuth.email
//             },
//         };

//         login.handler(event, null, (error, data) => {
//             console.log('login response', JSON.stringify(data));
//             try {
//                 expect(data.statusCode).toBe(422);
//                 let responseBody = JSON.parse(data.body)
//                 expect(responseBody.data[0].params.missingProperty).toBe('password');
//                 done();
//             } catch (error) {
//                 done(error);
//             }

//         });
//     });

//     it('Login invalid JSON(error scenario)', async done => {
//         let event = {
//             "headers": {
//                 "Content-Type": "application/json",
//             },
//             "body": '{"email":"emm", "password"="pwd"}',
//         };

//         login.handler(event, null, (error, data) => {
//             try {
//                 if (error)
//                     expect(error).toBeDefined();
//                 else 
//                     expect(data.statusCode).toBe(500);
//                 done();
//             } catch (error) {
//                 done(error);
//             }

//         });
//     });

//     it('Login with unregistered email', async done => {
//         // Mock DB response
//         DB.scan = jest.fn(() => ({
//             promise: () => new Promise(resolve => resolve(null)),
//         }));


//         let event = {
//             "body": {
//                 email: 'invalid' + newUserAuth.email,
//                 password: newUserAuth.password
//             },
//         };

//         login.handler(event, null, (error, data) => {
//             console.log('login response', JSON.stringify(data));
//             try {
//                 expect(data.statusCode).toBe(404);
//                 done();
//             } catch (error) {
//                 done(error);
//             }

//         });
//     });

//     it('Login with invalid password', async done => {
//         // Mock DB response
//         DB.scan = jest.fn(() => ({
//             promise: () => new Promise(resolve => resolve({ Items: [{...mockNewUserData}] })),
//         }));

//         let event = {
//             "body": {
//                 email: newUserAuth.email,
//                 password: 'invalid' + newUserAuth.password
//             },
//         };

//         login.handler(event, null, (error, data) => {
//             console.log('login response', JSON.stringify(data));
//             try {
//                 expect(data.statusCode).toBe(404);
//                 let responseBody = JSON.parse(data.body)
//                 console.debug(responseBody);
//                 done();
//             } catch (error) {
//                 done(error);
//             }
//         });
//     });
// });


// /**
//  * Tests for get()
//  */
describe('Get user', () => {
    beforeEach(() => { jest.resetModules(); process.env = { JWT_SECRET: 'reallystrongsecret' }; });

    it('Get user data', async done => {
        DB.get = jest.fn(() => ({
            promise: () => new Promise(resolve => resolve({ Item: {...mockNewUserData} })),
        }));

        // Create a event for Authorization 
        let event = getAuthorizationEventObject (mockNewUserData.lastToken);
        try {
            return auth(event).then((data) => { 
                expect(data).toBeDefined();
                expect(data.policyDocument.Statement[0].Effect).toBe("Allow");

                // Create a event for Handler 
                let userEvent = getHandlerEventObject (data);

                get.handler(userEvent, null, (error, data) => {
                    try {
                        console.log (JSON.stringify(data));

                        expect(data.statusCode).toBe(200);
                        let responseBody = JSON.parse(data.body)
                        expect(responseBody.data.firstName).toBe(mockNewUserData.firstName);
                        expect(responseBody.data.lastName).toBe(mockNewUserData.lastName);
                        expect(responseBody.data.email).toBe(mockNewUserData.email);
                        done();
                    } catch (error) {
                        done(error);
                    }
                });
            });              
        } catch (err) {
            console.log (err);
        } 
    });

    it('Get user data with invalid auth token(error scenario)', async done => {
        // Create invalid a event for Authorization 
        let event = getAuthorizationEventObject ("adsadsadasdasdas");
        try {
            return auth(event).then((data) => { 
                expect(data).toBeDefined();
                expect(data.policyDocument.Statement[0].Effect).toBe("Deny");
                done();
            });
        }
        catch (error) {
            done(error);
        }
    });

    it('Get user data without auth token(error scenario)', async done => {
        DB.get = jest.fn(() => ({
            promise: () => new Promise(resolve => resolve({ Item: {...mockNewUserData} })),
        }));

        let event = getAuthorizationEventObject ();
        try {
            return auth(event).then((data) => { 
                expect(data).toBeDefined();
                expect(data.policyDocument.Statement[0].Effect).toBe("Deny");
                done();
            });
        }
        catch (error) {
            done(error);
        }
    });
});


// /**
//  * Tests for update()
//  */
// describe('Update user', () => {
//     beforeEach(() => { jest.resetModules(); process.env = { JWT_SECRET: '123Abc123' }; });

//     it('Update user', async done => {
//         DB.scan = jest.fn(() => ({
//             promise: () => new Promise(resolve => resolve({ Items: [{...mockUpdatedUserData, id: mockNewUserData.id}] })),
//         }));
//         DB.update = jest.fn(() => ({
//             promise: () => new Promise(resolve => resolve({ Attributes: {...mockUpdatedUserData} })),
//         }));
//         let userEvent = {
//             ...userAuthorizer,
//             body: {
//                 ...mockUpdatedUserData
//             }
//         }
//         update(userEvent, null, (error, data) => {
//             console.log('update user response', error, data);
//             try {
//                 expect(data.statusCode).toBe(200);
//                 let responseBody = JSON.parse(data.body)
//                 expect(responseBody.data.firstName).toBe(mockUpdatedUserData.firstName);
//                 expect(responseBody.data.lastName).toBe(mockUpdatedUserData.lastName);
//                 expect(responseBody.data.email).toBe(mockUpdatedUserData.email);
//                 done();
//             } catch (error) {
//                 done(error);
//             }

//         });
//     });


//     it('Update user providing only firstName(error scenario)', async done => {
//         DB.scan = jest.fn(() => ({
//             promise: () => new Promise(resolve => resolve({ Items: [{...mockUpdatedUserData, id: mockNewUserData.id}] })),
//         }));
//         DB.update = jest.fn(() => ({
//             promise: () => new Promise(resolve => resolve({ Attributes: {...mockUpdatedUserData} })),
//         }));
//         let userEvent = {
//             ...userAuthorizer,
//             body: {
//                 firstName: mockUpdatedUserData.firstName
//             }
//         }
//         update(userEvent, null, (error, data) => {
//             console.log('update user response', error, data);
//             try {
//                 expect(data.statusCode).toBe(422);
//                 let responseBody = JSON.parse(data.body)
//                 expect(responseBody.data[0].params.missingProperty).toBe('lastName');
//                 done();
//             } catch (error) {
//                 done(error);
//             }

//         });
//     });


//     it('Update user providing only lastName(error scenario)', async done => {
//         DB.scan = jest.fn(() => ({
//             promise: () => new Promise(resolve => resolve({ Items: [{...mockUpdatedUserData, id: mockNewUserData.id}] })),
//         }));
//         DB.update = jest.fn(() => ({
//             promise: () => new Promise(resolve => resolve({ Attributes: {...mockUpdatedUserData} })),
//         }));
//         let userEvent = {
//             ...userAuthorizer,
//             body: {
//                 lastName: mockUpdatedUserData.lastName
//             }
//         }
//         update(userEvent, null, (error, data) => {
//             console.log('update user response', error, data);
//             try {
//                 expect(data.statusCode).toBe(422);
//                 let responseBody = JSON.parse(data.body)
//                 expect(responseBody.data[0].params.missingProperty).toBe('firstName');
//                 done();
//             } catch (error) {
//                 done(error);
//             }

//         });
//     });

//     it('Update user providing only password(error scenario)', async done => {
//         DB.scan = jest.fn(() => ({
//             promise: () => new Promise(resolve => resolve({ Items: [{...mockUpdatedUserData, id: mockNewUserData.id}] })),
//         }));
//         DB.update = jest.fn(() => ({
//             promise: () => new Promise(resolve => resolve({ Attributes: {...mockUpdatedUserData} })),
//         }));
//         let userEvent = {
//             ...userAuthorizer,
//             body: {
//                 password: 'abcd1234'
//             }
//         }
//         update(userEvent, null, (error, data) => {
//             console.log('update user response', error, data);
//             try {
//                 expect(data.statusCode).toBe(422);
//                 let responseBody = JSON.parse(data.body)
//                 expect(responseBody.data[0].params.missingProperty).toBe('firstName');
//                 done();
//             } catch (error) {
//                 done(error);
//             }

//         });
//     });


//     it('Update user providing invalid email(error scenario)', async done => {
//         DB.scan = jest.fn(() => ({
//             promise: () => new Promise(resolve => resolve({ Items: [{...mockUpdatedUserData, id: mockNewUserData.id}] })),
//         }));
//         DB.update = jest.fn(() => ({
//             promise: () => new Promise(resolve => resolve({ Attributes: {...mockUpdatedUserData} })),
//         }));
//         let userEvent = {
//             ...userAuthorizer,
//             body: {
//                 ...mockUpdatedUserData,
//                 email: 'invalid'
//             }
//         }
//         update(userEvent, null, (error, data) => {
//             console.log('update user response', error, data);
//             try {
//                 expect(data.statusCode).toBe(422);
//                 done();
//             } catch (error) {
//                 done(error);
//             }

//         });
//     });



//     it('Update user providing empty firstname(error scenario)', async done => {
//         DB.scan = jest.fn(() => ({
//             promise: () => new Promise(resolve => resolve({ Items: [{...mockUpdatedUserData, id: mockNewUserData.id}] })),
//         }));
//         DB.update = jest.fn(() => ({
//             promise: () => new Promise(resolve => resolve({ Attributes: {...mockUpdatedUserData} })),
//         }));
//         let userEvent = {
//             ...userAuthorizer,
//             body: {
//                 ...mockUpdatedUserData,
//                 firstName: ''
//             }
//         }
//         update(userEvent, null, (error, data) => {
//             console.log('update user response', error, data);
//             try {
//                 expect(data.statusCode).toBe(422);
//                 let responseBody = JSON.parse(data.body)
//                 expect(responseBody.data[0].keyword).toBe('minLength');
//                 done();
//             } catch (error) {
//                 done(error);
//             }

//         });
//     });

//     it('Update user providing empty lastname(error scenario)', async done => {
//         DB.scan = jest.fn(() => ({
//             promise: () => new Promise(resolve => resolve({ Items: [{...mockUpdatedUserData, id: mockNewUserData.id}] })),
//         }));
//         DB.update = jest.fn(() => ({
//             promise: () => new Promise(resolve => resolve({ Attributes: {...mockUpdatedUserData} })),
//         }));
//         let userEvent = {
//             ...userAuthorizer,
//             body: {
//                 ...mockUpdatedUserData,
//                 password: ''
//             }
//         }
//         update(userEvent, null, (error, data) => {
//             console.log('update user response', error, data);
//             try {
//                 expect(data.statusCode).toBe(422);
//                 let responseBody = JSON.parse(data.body)
//                 expect(responseBody.data[0].keyword).toBe('minLength');
//                 done();
//             } catch (error) {
//                 done(error);
//             }

//         });
//     });


// });



// /**
//  * Tests for delete()
//  */
// describe('Delete user', () => {
//     beforeEach(() => { jest.resetModules(); process.env = { JWT_SECRET: '123Abc123' }; });

//     it('Delete user', async done => {
//         DB.update = jest.fn(() => ({
//             promise: () => new Promise(resolve => resolve({ Attributes: {...mockUpdatedUserData, deletedAt: 1536134213980} })),
//         }));
//         let userEvent = {
//             ...userAuthorizer,
//         }
//         userDelete(userEvent, null, (error, data) => {
//             console.log('update deleted response', error, data);
//             try {
//                 expect(data.statusCode).toBe(200);
//                 let responseBody = JSON.parse(data.body)
//                 expect(responseBody.data.deletedAt).toBeDefined();
//                 done();
//             } catch (error) {
//                 done(error);
//             }

//         });
//     });


//     it('Delete user data with invalid auth token(error scenario)', async done => {
//         DB.get = jest.fn(() => ({
//             promise: () => new Promise(resolve => resolve({ Item: {...mockNewUserData} })),
//         }));
//         let event = {
//             "authorizationToken":  'Bearer invalid' + userToken
//         };
//         auth(event, null, (error, data) => {
//             try {
//                 expect(data.statusCode).toBe(403);
//                 done();

//             } catch (error) {
//                 done(error);
//             }

//         });

//     });
//     it('Delete user data without auth token(error scenario)', async done => {
//         DB.get = jest.fn(() => ({
//             promise: () => new Promise(resolve => resolve({ Item: {...mockNewUserData} })),
//         }));
//         let event = {
//         };
//         auth(event, null, (error, data) => {
//             try {
//                 expect(data).toBe('Unauthorized');
//                 done();

//             } catch (error) {
//                 done(error);
//             }

//         });

//     });

// });

const getAuthorizationEventObject = function (token) {
    return (
        {
        type: "TOKEN",
        authorizationToken:"Bearer " + token,
        methodArn:"arn:aws:execute-api:undefined:random-account-id:random-api-id/undefined/GET/user",
        requestContext:{
            accountId:"random-account-id",
            resourceId:"random-resource-id",
            requestId:"random-request-id",
            resourcePath:"/user",
            httpMethod:"GET",
            apiId:"random-api-id"
        }
    });
}

const getHandlerEventObject = function (data) {
    userAuthorizer = {
        requestContext: {
            authorizer: {
                ...data.context,
                principalId: data.principalId,
            }
        }
    };

    let userEvent = {
        ...userAuthorizer
    }

    return userEvent;
}
