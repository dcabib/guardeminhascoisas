const jwt = require('jsonwebtoken');
const DB = require('../../../database/db');

// // Unit Tests
const { signToken } = require('../../../app/users/lambdas/Helpers/UsersModel');
const { auth } = require('../../../app/users/lambdas/Authorizer/authorizer');
const register  = require ("../../../app/users/lambdas/register/register");
const login = require('../../../app/users/lambdas/login/login');
const get = require('../../../app/users/lambdas/get/get');
const refreshToken = require('../../../app/users/lambdas/refreshToken/refreshToken');
const update = require('../../../app/users/lambdas/update/update');
const deleteUser = require('../../../app/users/lambdas/delete/delete');

const mockExitingUserData = {
    id: "ea457f7c-e32e-4dde-b876-01c7f2bb453b",
    firstName: "Eduardo",
    lastName: "Abib",
    email: "eduardo@abib.com",
    password : "$2a$08$fg5dDRlQcidVG6OzF8lPNu5DwE5JdQprMI3LddJd.nU/a9spQYqpa",
    level: "standard",
    lastToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImVhNDU3ZjdjLWUzMmUtNGRkZS1iODc2LTAxYzdmMmJiNDUzYiIsImVtYWlsIjoiZWR1YXJkb0BhYmliLmNvbSIsImlhdCI6MTU5OTQ5MzgzOSwiZXhwIjoxNTk5NTgwMjM5fQ.5W-bT8lZqHW09xuiWDYkRmqt-kZZdxLcDpaRZaI22r0",
    createdAt: 1599493836994,
    updatedAt: 1599493836994
};

const mockNewUserData = {
    id: "87771d49-d964-4287-92f2-b437597d406b",
    firstName: "Joao",
    lastName: "Pedro Oliveira",
    email: "joao@pedro.com",
    password : "$2a$08$fg5dDRlQcidVG6OzF8lPNu5DwE5JdQprMI3LddJd.nU/a9spQYqpa",
    level: "standard",
    lastToken : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijg3NzcxZDQ5LWQ5NjQtNDI4Ny05MmYyLWI0Mzc1OTdkNDA2YiIsImVtYWlsIjoiam9hb0BwZWRyby5jb20iLCJpYXQiOjE1OTk0OTQwMDgsImV4cCI6MTU5OTU4MDQwOH0.FWFr9r9NNeWInYsiP1X9SvwnCviGTSevAffMHeMZ03Q",
    createdAt: 1599493998135,
    updatedAt: 1599493998135
};

const mockUpdatedUserData = {
    firstName: 'UpdatedFirstName',
    lastName: 'UpdatedLastName',
    email: mockNewUserData.email,
    password: 'NewPassword'
}

const newUserAuth = {
    email: mockNewUserData.email,
    password: '123Abc123'
}

/**
 * Tests for register()
 */
describe('Register', () => {
    beforeEach(() => { jest.resetModules(); process.env = { JWT_SECRET: 'reallystrongsecret' }; });

    it('Should Register with valid data', async done => {
        // Mock DB response
        DB.scan = jest.fn(() => ({
            promise: () => new Promise(reject => resolve({ Item: {...mockNewUserData} })),
        }));
        DB.put = jest.fn(() => ({
            promise: () => new Promise(resolve => resolve({ Items: [mockNewUserData]} )),
        }));
        DB.get = jest.fn(() => ({
            promise: () => new Promise(resolve => resolve({ mockNewUserData })),
        }));

        DB.add = jest.fn(() => ({
            promise: () => new Promise(resolve => resolve({ Item: {...mockNewUserData} })),
        }));
        
        let event = {
            "body": {
                "firstName": mockNewUserData.firstName,
                "lastName": mockNewUserData.lastName,
                "email": mockNewUserData.email,
                "password": newUserAuth.password
            },
        };

        register.handler(event, null, (error, data) => {
            try {
                expect(data.statusCode).toBe(201);
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

    it('Should not Register without firstname(error scenario)', async done => {
        let event = {
            "body": {
                "lastName": mockNewUserData.lastName,
                "email": mockNewUserData.email,
                "password": newUserAuth.password
            },
        };

        register.handler(event, null, (error, data) => {
            try {
                expect(data.statusCode).toBe(422);
                let responseBody = JSON.parse(data.body)
                expect(responseBody.data[0].params.missingProperty).toBe('firstName');
                done();
            } catch (error) {
                done(error);
            }
        });
    });

    it('Should not Register without lastname(error scenario)', async done => {
        let event = {
            "body": {
                "firstName": mockNewUserData.firstName,
                "email": mockNewUserData.email,
                "password": newUserAuth.password
            },
        };

        register.handler(event, null, (error, data) => {
            try {
                expect(data.statusCode).toBe(422);
                let responseBody = JSON.parse(data.body)
                expect(responseBody.data[0].params.missingProperty).toBe('lastName');
                done();
            } catch (error) {
                done(error);
            }
        });
    });

    it('Should not Register without email(error scenario)', async done => {
        let event = {
            "body": {
                "firstName": mockNewUserData.firstName,
                "lastName": mockNewUserData.lastName,
                "password": newUserAuth.password
            },
        };

        register.handler(event, null, (error, data) => {
            try {
                expect(data.statusCode).toBe(422);
                let responseBody = JSON.parse(data.body)
                expect(responseBody.data[0].params.missingProperty).toBe('email');
                done();
            } catch (error) {
                done(error);
            }
        });
    });

    it('Should not Register invalid JSON(error scenario)', async done => {
        let event = {
            "headers": {
                "Content-Type": "application/json",
            },
            "body": '{"firstname":"fname", "lastName"="lname"}',
        };

        register.handler(event, null, (error, data) => {
            try {
                if (error)
                    expect(error).toBeDefined();
                else 
                    expect(data.statusCode).toBe(400);
                done();
            } catch (error) {
                done(error);
            }
        });
    });
});

/**
 * Tests for login()
 */
describe('Login', () => {
    beforeEach(() => { jest.resetModules(); process.env = { JWT_SECRET: 'reallystrongsecret' }; });

    it('Should Login user with valid credentials', async done => {
        // Mock DB response

        // DB will be called by userByEmail - Check if email exsists
        DB.scan = jest.fn(() => ({
            promise: () => new Promise(resolve => resolve({ Items: [{...mockNewUserData}] })),
        }));

        // Sign token with credentials to compare with handler's reponse
        mockNewUserData.lastToken = signToken(mockNewUserData.id, mockNewUserData.email);
        // DB will be called by updateUser 
        DB.update = jest.fn(() => ({
            promise: () => new Promise(resolve => resolve({ Attributes: {lastToken: mockNewUserData.lastToken} })),
        }));

        // Create a Body request
        let event = {
            "body": {...newUserAuth},
        };

        // Calling Handler
        login.handler(event, null, (error, data) => {
            console.log('login response', JSON.stringify(data));
            try {
                console.log (data);
                expect(data.statusCode).toBe(200);
                let responseBody = JSON.parse(data.body)
                expect(responseBody.data.token).toBe(mockNewUserData.lastToken);
                userToken = mockNewUserData.lastToken;
                done();
            } catch (error) {
                done(error);
            }

        });
    });

    it('Should not login user without email (error scenario)', async done => {
        let event = {
            "body": {
                password: newUserAuth.password
            },
        };

        login.handler(event, null, (error, data) => {
            console.log('login response', JSON.stringify(data));
            try {
                expect(data.statusCode).toBe(422);
                let responseBody = JSON.parse(data.body)
                expect(responseBody.data[0].params.missingProperty).toBe('email');
                done();
            } catch (error) {
                done(error);
            }

        });
    });

    it('Should not login user without password (error scenario)', async done => {
        let event = {
            "body": {
                email: newUserAuth.email
            },
        };

        login.handler(event, null, (error, data) => {
            console.log('login response', JSON.stringify(data));
            try {
                expect(data.statusCode).toBe(422);
                let responseBody = JSON.parse(data.body)
                expect(responseBody.data[0].params.missingProperty).toBe('password');
                done();
            } catch (error) {
                done(error);
            }

        });
    });

    it('Should not login invalid JSON (error scenario)', async done => {
        let event = {
            "headers": {
                "Content-Type": "application/json",
            },
            "body": '{"email":"emm, "password"="pwd"}',
        };

        login.handler(event, null, (error, data) => {
            try {
                if (error)
                    expect(error).toBeDefined();
                else 
                    expect(data.statusCode).toBe(400);
                done();
            } catch (error) {
                done(error);
            }

        });
    });

    it('Should not login with unregistered email (error scenario)', async done => {
        // Mock DB response
        DB.scan = jest.fn(() => ({
            promise: () => new Promise(resolve => resolve(null)),
        }));


        let event = {
            "body": {
                email: 'invalid' + newUserAuth.email,
                password: newUserAuth.password
            },
        };

        login.handler(event, null, (error, data) => {
            console.log('login response', JSON.stringify(data));
            try {
                expect(data.statusCode).toBe(404);
                done();
            } catch (error) {
                done(error);
            }

        });
    });

    it('Should not login with invalid password (error scenario)', async done => {
        // Mock DB response
        DB.scan = jest.fn(() => ({
            promise: () => new Promise(resolve => resolve({ Items: [{...mockNewUserData}] })),
        }));

        let event = {
            "body": {
                email: newUserAuth.email,
                password: 'invalid' + newUserAuth.password
            },
        };

        login.handler(event, null, (error, data) => {
            console.log('login response', JSON.stringify(data));
            try {
                expect(data.statusCode).toBe(404);
                let responseBody = JSON.parse(data.body)
                console.debug(responseBody);
                done();
            } catch (error) {
                done(error);
            }
        });
    });
});

/**
 * Tests for get()
 */
describe('Get user', () => {
    beforeEach(() => { jest.resetModules(); process.env = { JWT_SECRET: 'reallystrongsecret' }; });

    it('Should get user data', async done => {
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

    it('Should not get user data with invalid auth token (error scenario)', async done => {
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

    it('Should not get user data without auth token(error scenario)', async done => {
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

    it('Should not get user data with valid but expered auth token (error scenario)', async done => {
        // Create invalid a event for Authorization 
        let event = getAuthorizationEventObject ("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjQwNzAxMTE1LTQ2MzYtNDA4ZS1iNmJlLTA4MDUyZDhjMDAxZiIsImVtYWlsIjoiam9obkBzbWl0aC5jb20iLCJpYXQiOjE1OTkzNDA0NTQsImV4cCI6MTU5OTQyNjg1NH0.TZUjQYqqew4XAsLSEmw6LvsuIovUjMIo63WQGolkJnc");
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

/**
 * Tests for refreshToken()
 */
describe('Get refreshed user token', () => {
    beforeEach(() => { jest.resetModules(); process.env = { JWT_SECRET: 'reallystrongsecret' }; });

    it('Should get/refresh a new user token', async done => {
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

                refreshToken.handler(userEvent, null, (error, data) => {
                    try {
                        expect(data.statusCode).toBe(200);
                        let responseBody = JSON.parse(data.body)
                        expect(responseBody.data.token).toBeDefined();
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

    it('Should not get/refresh user token with invalid auth token (error scenario)', async done => {
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

    it('Should not get/refresh user token without auth token(error scenario)', async done => {
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

    it('Should not get/refresh user token with valid but expered auth token (error scenario)', async done => {
        // Create invalid a event for Authorization 
        let event = getAuthorizationEventObject ("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjQwNzAxMTE1LTQ2MzYtNDA4ZS1iNmJlLTA4MDUyZDhjMDAxZiIsImVtYWlsIjoiam9obkBzbWl0aC5jb20iLCJpYXQiOjE1OTkzNDA0NTQsImV4cCI6MTU5OTQyNjg1NH0.TZUjQYqqew4XAsLSEmw6LvsuIovUjMIo63WQGolkJnc");
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

/**
 * Tests for update()
 */
describe('Update user', () => {
    beforeEach(() => { jest.resetModules(); process.env = { JWT_SECRET: 'reallystrongsecret' }; });

    it('Should update user information (success scenario)', async done => {
        DB.get = jest.fn(() => ({
            promise: () => new Promise(resolve => resolve({ Item: {...mockNewUserData} })),
        }));
        DB.update = jest.fn(() => ({
            promise: () => new Promise(resolve => resolve({ Attributes: {...mockUpdatedUserData} })),
        }));

        // Create a event for Authorization 
        let event = getAuthorizationEventObject (mockNewUserData.lastToken);
        try {
            return auth(event).then((data) => { 
                expect(data).toBeDefined();
                expect(data.policyDocument.Statement[0].Effect).toBe("Allow");

                // Create a event for Handler 
                let userEvent = getHandlerEventObject (data);

                // Add body info (firstName, lastName, emai, password) to call handler
                userEvent.body = { ...mockUpdatedUserData};

                update.handler(userEvent, null, (error, data) => {
                    try {
                        expect(data.statusCode).toBe(200);
                        let responseBody = JSON.parse(data.body)
                        console.log (JSON.stringify(responseBody));
                        expect(responseBody.data.user.Attributes.firstName).toBe(mockUpdatedUserData.firstName);
                        expect(responseBody.data.user.Attributes.lastName).toBe(mockUpdatedUserData.lastName);
                        expect(responseBody.data.user.Attributes.email).toBe(mockUpdatedUserData.email);
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

    it('Should update user information - only email was informed (success scenario)', async done => {
        DB.get = jest.fn(() => ({
            promise: () => new Promise(resolve => resolve({ Item: {...mockNewUserData} })),
        }));
        DB.update = jest.fn(() => ({
            promise: () => new Promise(resolve => resolve({ Attributes: {...mockUpdatedUserData} })),
        }));

        // Create a event for Authorization 
        let event = getAuthorizationEventObject (mockNewUserData.lastToken);
        try {
            return auth(event).then((data) => { 
                expect(data).toBeDefined();
                expect(data.policyDocument.Statement[0].Effect).toBe("Allow");

                // Create a event for Handler 
                let userEvent = getHandlerEventObject (data);

                // Add body info (emai) to call handler
                userEvent.body = { email: mockUpdatedUserData.email};

                update.handler(userEvent, null, (error, data) => {
                    try {
                        expect(data.statusCode).toBe(200);
                        let responseBody = JSON.parse(data.body)
                        console.log (JSON.stringify(responseBody));
                        expect(responseBody.data.user.Attributes.firstName).toBe(mockUpdatedUserData.firstName);
                        expect(responseBody.data.user.Attributes.lastName).toBe(mockUpdatedUserData.lastName);
                        expect(responseBody.data.user.Attributes.email).toBe(mockUpdatedUserData.email);
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

    it('Should update user information - only password was informed (success scenario)', async done => {
        DB.get = jest.fn(() => ({
            promise: () => new Promise(resolve => resolve({ Item: {...mockNewUserData} })),
        }));
        DB.update = jest.fn(() => ({
            promise: () => new Promise(resolve => resolve({ Attributes: {...mockUpdatedUserData} })),
        }));

        // Create a event for Authorization 
        let event = getAuthorizationEventObject (mockNewUserData.lastToken);
        try {
            return auth(event).then((data) => { 
                expect(data).toBeDefined();
                expect(data.policyDocument.Statement[0].Effect).toBe("Allow");

                // Create a event for Handler 
                let userEvent = getHandlerEventObject (data);

                // Add body info (password) to call handler
                userEvent.body = { password: mockUpdatedUserData.password };

                console.log (JSON.stringify(userEvent));

                update.handler(userEvent, null, (error, data) => {
                    try {
                        expect(data.statusCode).toBe(200);
                        let responseBody = JSON.parse(data.body)
                        console.log (JSON.stringify(responseBody));
                        expect(responseBody.data.user.Attributes.firstName).toBe(mockUpdatedUserData.firstName);
                        expect(responseBody.data.user.Attributes.lastName).toBe(mockUpdatedUserData.lastName);
                        expect(responseBody.data.user.Attributes.email).toBe(mockUpdatedUserData.email);
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

    it('Should not update user information - no values to update (error scenario)', async done => {
        DB.get = jest.fn(() => ({
            promise: () => new Promise(resolve => resolve({ Item: {...mockNewUserData} })),
        }));
        DB.update = jest.fn(() => ({
            promise: () => new Promise(resolve => resolve({ Attributes: {...mockUpdatedUserData} })),
        }));

        // Create a event for Authorization 
        let event = getAuthorizationEventObject (mockNewUserData.lastToken);
        try {
            return auth(event).then((data) => { 
                expect(data).toBeDefined();
                expect(data.policyDocument.Statement[0].Effect).toBe("Allow");

                // Create a event for Handler 
                let userEvent = getHandlerEventObject (data);

                // NO body info (firstName, lastName, emai, password) to call handler
                userEvent.body = { };

                update.handler(userEvent, null, (error, data) => {
                    try {
                        expect(data.statusCode).toBe(400);
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

    it('Should not update user information - email already exists (error scenario)', async done => {
        DB.get = jest.fn(() => ({
            promise: () => new Promise(resolve => resolve({ Item: {...mockNewUserData} })),
        }));
        DB.scan = jest.fn(() => ({
            promise: () => new Promise(resolve => resolve({ Items: [{...mockExitingUserData}] })),
        }));
        DB.update = jest.fn(() => ({
            promise: () => new Promise(resolve => resolve({ Attributes: {...mockUpdatedUserData} })),
        }));

        // Create a event for Authorization 
        let event = getAuthorizationEventObject (mockNewUserData.lastToken);
        try {
            return auth(event).then((data) => { 
                expect(data).toBeDefined();
                expect(data.policyDocument.Statement[0].Effect).toBe("Allow");

                // Create a event for Handler 
                let userEvent = getHandlerEventObject (data);

                // Body info (firstName, lastName, emai, password) to call handler
                userEvent.body = { ...mockUpdatedUserData};

                // Passing a email that is already in use
                userEvent.body.email = mockExitingUserData.email;;

                update.handler(userEvent, null, (error, data) => {
                    try {
                        expect(data.statusCode).toBe(409);
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

    it('Should not update user information - invalid JSON (error scenario)', async done => {
        let event = {
            "headers": {
                "Content-Type": "application/json",
            },
            "body": '{"email":"emm, "password"="pwd"}',
        };

        update.handler(event, null, (error, data) => {
            try {
                if (error)
                    expect(error).toBeDefined();
                else 
                    expect(data.statusCode).toBe(400);
                done();
            } catch (error) {
                done(error);
            }

        });
    });

});

/**
 * Tests for delete()
 */
describe('Delete user', () => {
    beforeEach(() => { jest.resetModules(); process.env = { JWT_SECRET: 'reallystrongsecret' }; });

    it('Should delete user (success scenario)', async done => {
        DB.get = jest.fn(() => ({
            promise: () => new Promise(resolve => resolve({ Item: {...mockNewUserData} })),
        }));
        DB.get = jest.fn(() => ({
            promise: () => new Promise(resolve => resolve({ Item: {...mockNewUserData} })),
        }));
        DB.delete = jest.fn(() => ({
            promise: () => new Promise(resolve => resolve({...mockNewUserData})),
        }));

        // Create a event for Authorization 
        let event = getAuthorizationEventObject (mockNewUserData.lastToken);
        try {
            return auth(event).then((data) => { 
                expect(data).toBeDefined();
                expect(data.policyDocument.Statement[0].Effect).toBe("Allow");

                // Create a event for Handler 
                let userEvent = getHandlerEventObject (data);

                deleteUser.handler(userEvent, null, (error, data) => {
                    try {
                        expect(data.statusCode).toBe(200);
                        let responseBody = JSON.parse(data.body)
                        expect(responseBody.message).toBe("User was successfully deleted");
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

    it('Should not delete user - invalid token (error scenario)', async done => {
        // Create a event for Authorization with invalid token
        let event = getAuthorizationEventObject ("invalid-token-information");
        try {
            return auth(event).then((data) => { 
                expect(data).toBeDefined();
                expect(data.policyDocument.Statement[0].Effect).toBe("Deny");
                done();
            });              
        } catch (err) {
            console.log (err);
        } 
    });

    it('Should not delete user - without a token (error scenario)', async done => {
        // Create a event for Authorization without a token
        let event = getAuthorizationEventObject (null);
        try {
            return auth(event).then((data) => { 
                expect(data).toBeDefined();
                expect(data.policyDocument.Statement[0].Effect).toBe("Deny");
                done();
            });              
        } catch (err) {
            console.log (err);
        } 
    });

    it('Should not delete user -  - invalid JSON (error scenario)', async done => {
        let event = {
            "headers": {
                "Content-Type": "application/json",
            },
            "body": '{"email":"emm, "password"="pwd"}',
        };

        deleteUser.handler(event, null, (error, data) => {
            try {
                if (error)
                    expect(error).toBeDefined();
                else 
                    expect(data.statusCode).toBe(400);
                done();
            } catch (error) {
                done(error);
            }

        });
    });
});


/*
* Helper function to create an event object.
*/
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

/*
* Helper function to create an handler event object.
*/
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
