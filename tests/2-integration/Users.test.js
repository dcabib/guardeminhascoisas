var axios = require('axios');
const testURL = 'http://localhost:3000';
let userToken
const getURL = (path) =>
    process.env.TEST_URL + path

const mockNewUserData = {
    firstName: 'John',
    lastName: 'Doe',
    email: (Math.floor(Math.random() * Math.floor(10000))) + 'john@doe.com',
    password: 'abc113adb',
};

const mockUpdatedUserData = {
    firstName: 'John',
    lastName: 'Smith',
    email: (Math.floor(Math.random() * Math.floor(10000))) + 'john@smith.com',
    password: '123abcd432',
};

/**
 * Tests for Register
 */
describe('Register', () => {
    beforeEach(() => { jest.resetModules(); process.env = { JWT_SECRET: '123Abc123', TEST_URL: testURL }; });

    it('Register with valid data', async done => {
        axios.post(getURL('/register'), mockNewUserData)
            .then((res) => {
                expect(res.status).toBe(201);
            })
            .catch((err) => {
                console.error(err && err.response && err.response.data ? err.response.data.message : err);
                throw new Error('Test Failed');
            })
            .then(() => {
                done();
            })
    });

    it('Register without firstname(error scenario)', async done => {
        axios.post(getURL('/register'), {
            "lastName": "Smith",
            "email": "test@mail.co",
            "password": "abc113adb"
        })
            .then(() => {
                throw new Error('Test failed');
            })
            .catch((err) => {
                console.log(JSON.stringify(err.response));
                expect(err.response.status).toBe(422);
                expect(err.response.data.data[0].params.missingProperty).toBe('firstName');
            })
            .then(() => {
                done();
            })
    });

    it('Register without lastname(error scenario)', async done => {
        axios.post(getURL('/register'), {
            "firstName": "John",
            "email": "test@mail.co",
            "password": "abc113adb"
        })
            .then(() => {
                throw new Error('Test failed');
            })
            .catch((err) => {
                console.log(JSON.stringify(err.response));
                expect(err.response.status).toBe(422);
                expect(err.response.data.data[0].params.missingProperty).toBe('lastName');
            })
            .then(() => {
                done();
            })
    });

    it('Register without password(error scenario)', async done => {
        axios.post(getURL('/register'), {
            "firstName": "John",
            "lastName": "Smith",
            "email": "test@mail.co",
        })
            .then(() => {
                throw new Error('Test failed');
            })
            .catch((err) => {
                console.log(JSON.stringify(err.response));
                expect(err.response.status).toBe(422);
                expect(err.response.data.data[0].params.missingProperty).toBe('password');
            })
            .then(() => {
                done();
            })
    });

    it('Register invalid JSON (error scenario)', async done => {
        axios.post(getURL('/register'), '{"firstName": "John","lastName": "Smith","email": "test@mail.co" "password": "abc123abc"}', {
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(() => {
                throw new Error('Test failed');
            })
            .catch((err) => {
                console.log(JSON.stringify(err.response));
                expect(err.response.status).toBe(500);
            })
            .then(() => {
                done();
            })
    });
});

/**
 * Tests for Login
 */
describe('Login', () => {
    beforeEach(() => { jest.resetModules(); process.env = { JWT_SECRET: '123Abc123', TEST_URL: testURL }; });


    it('Login with valid data', async done => {
        axios.post(getURL('/login'), {
            "email": mockNewUserData.email,
            "password": mockNewUserData.password
        })
            .then((res) => {
                console.info(res);
                expect(res.status).toBe(200);
                expect(res.data.data.token).toBeDefined();
                userToken = res.data.data.token;
            })
            .catch((err) => {
                console.error(err && err.response && err.response.data ? err.response.data.message : err);
                throw new Error('Test Failed');
            })
            .then(() => {
                done();
            })
    });

    it('Login without email(error scenario)', async done => {
        axios.post(getURL('/login'), {
            "password": mockNewUserData.password
        })
            .then(() => {
                throw new Error('Test failed');
            })
            .catch((err) => {
                console.log(JSON.stringify(err.response));
                expect(err.response.status).toBe(422);
                expect(err.response.data.data[0].params.missingProperty).toBe('email');
            })
            .then(() => {
                done();
            })
    });

    it('Login without password(error scenario)', async done => {
        axios.post(getURL('/login'), {
            "email": mockNewUserData.email,
        })
            .then(() => {
                throw new Error('Test failed');
            })
            .catch((err) => {
                console.log(JSON.stringify(err.response));
                expect(err.response.status).toBe(422);
                expect(err.response.data.data[0].params.missingProperty).toBe('password');
            })
            .then(() => {
                done();
            })
    });

    it('Login invalid JSON (error scenario)', async done => {
        axios.post(getURL('/login'), '{"email": "email", "password"= "abc123abc"}', {
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(() => {
                throw new Error('Test failed');
            })
            .catch((err) => {
                console.log(JSON.stringify(err.response));
                expect(err.response.status).toBe(500);
            })
            .then(() => {
                done();
            })
    });


    it('Login with unregistered email', async done => {
        axios.post(getURL('/login'), {
            "email": 'invalid' + mockNewUserData.email,
            "password": mockNewUserData.password
        })
            .then(() => {
                throw new Error('Test failed');
            })
            .catch((err) => {
                console.log(JSON.stringify(err.response));
                expect(err.response.status).toBe(404);
            })
            .then(() => {
                done();
            })
    });
    it('Login with invalid password', async done => {
        axios.post(getURL('/login'), {
            "email": mockNewUserData.email,
            "password": 'invalid' + mockNewUserData.password
        })
            .then(() => {
                throw new Error('Test failed');
            })
            .catch((err) => {
                console.log(JSON.stringify(err.response));
                expect(err.response.status).toBe(404);
            })
            .then(() => {
                done();
            })
    });

});


/**
 * Tests for GET
 */
describe('Get user', () => {
    beforeEach(() => { jest.resetModules(); process.env = { JWT_SECRET: '123Abc123', TEST_URL: testURL }; });

    it('Get user data', async done => {
        axios.get(getURL('/user'), {
            headers: {
                'Authorization': 'Bearer ' + userToken
            }
        })
            .then((res) => {
                expect(res.status).toBe(200);
                expect(res.data.data.firstName).toEqual(mockNewUserData.firstName);
                expect(res.data.data.lastName).toEqual(mockNewUserData.lastName);
                expect(res.data.data.email).toEqual(mockNewUserData.email);
                expect(res.data.data.lastToken).toEqual(userToken);
            })
            .catch((err) => {
                console.error(err && err.response && err.response.data ? err.response.data.message : err);
                throw new Error('Test Failed');
            })
            .then(() => {
                done();
            })
    });

    it('Get user data with invalid auth token(error scenario)', async done => {
        axios.get(getURL('/user'), {
            headers: {
                'Authorization': 'Bearer invalid' + userToken
            }
        })
            .then(() => {
                throw new Error('Test failed');
            })
            .catch((err) => {
                console.log(JSON.stringify(err.response));
                expect(err.response.status).toBe(403);
            })
            .then(() => {
                done();
            })
    });

    it('Get user data without auth token(error scenario)', async done => {
        axios.get(getURL('/user'))
            .then(() => {
                throw new Error('Test failed');
            })
            .catch((err) => {
                console.log(JSON.stringify(err.response));
                expect(err.response.status).toBe(403);
            })
            .then(() => {
                done();
            })
    });

});


/**
 * Tests for Update
 */
describe('Update user', () => {
    beforeEach(() => { jest.resetModules(); process.env = { JWT_SECRET: '123Abc123', TEST_URL: testURL }; });

    it('Update with valid data', async done => {
        axios.put(getURL('/user'), mockUpdatedUserData, {
            headers: {
                'Authorization': 'Bearer ' + userToken
            }
        })
            .then((res) => {
                expect(res.status).toBe(200);
                expect(res.data.data.firstName).toEqual(mockUpdatedUserData.firstName);
                expect(res.data.data.lastName).toEqual(mockUpdatedUserData.lastName);
                expect(res.data.data.email).toEqual(mockUpdatedUserData.email);
            })
            .catch((err) => {
                console.error(err && err.response && err.response.data ? err.response.data.message : err);
                throw new Error('Test Failed');
            })
            .then(() => {
                done();
            })
    });

    it('Update with providing only firstname(error scenario)', async done => {
        axios.put(getURL('/user'), {
            firstName: mockNewUserData.firstName
        }, {
            headers: {
                'Authorization': 'Bearer ' + userToken
            }
        })
            .then(() => {
                throw new Error('Test failed');
            })
            .catch((err) => {
                console.log(JSON.stringify(err.response));
                expect(err.response.status).toBe(422);
            })
            .then(() => {
                done();
            })
    });

    it('Update with providing only lastname(error scenario)', async done => {
        axios.put(getURL('/user'), {
            lastName: mockNewUserData.lastName
        }, {
            headers: {
                'Authorization': 'Bearer ' + userToken
            }
        })
            .then(() => {
                throw new Error('Test failed');
            })
            .catch((err) => {
                console.log(JSON.stringify(err.response));
                expect(err.response.status).toBe(422);
            })
            .then(() => {
                done();
            })
    });

    it('Update with providing only password(error scenario)', async done => {
        axios.put(getURL('/user'), {
            password: mockNewUserData.password
        }, {
            headers: {
                'Authorization': 'Bearer ' + userToken
            }
        })
            .then(() => {
                throw new Error('Test failed');
            })
            .catch((err) => {
                console.log(JSON.stringify(err.response));
                expect(err.response.status).toBe(422);
            })
            .then(() => {
                done();
            })
    });

    it('Update with providing invalid auth token(error scenario)', async done => {
        axios.put(getURL('/user'), mockNewUserData, {
            headers: {
                'Authorization': 'Bearer invalid' + userToken
            }
        })
            .then(() => {
                throw new Error('Test failed');
            })
            .catch((err) => {
                console.log(JSON.stringify(err.response));
                expect(err.response.status).toBe(403);
            })
            .then(() => {
                done();
            })
    });


    it('Update with providing invalid email(error scenario)', async done => {
        axios.put(getURL('/user'), {...mockNewUserData, email: 'invalid'}, {
            headers: {
                'Authorization': 'Bearer ' + userToken
            }
        })
            .then(() => {
                throw new Error('Test failed');
            })
            .catch((err) => {
                console.log(JSON.stringify(err.response));
                expect(err.response.status).toBe(422);
            })
            .then(() => {
                done();
            })
    });

    it('Update with providing empty firstName(error scenario)', async done => {
        axios.put(getURL('/user'), {...mockNewUserData, firstName: ''}, {
            headers: {
                'Authorization': 'Bearer ' + userToken
            }
        })
            .then(() => {
                throw new Error('Test failed');
            })
            .catch((err) => {
                console.log(JSON.stringify(err.response));
                expect(err.response.status).toBe(422);
            })
            .then(() => {
                done();
            })
    });

    it('Update with providing empty lastName(error scenario)', async done => {
        axios.put(getURL('/user'), {...mockNewUserData, lastName: ''}, {
            headers: {
                'Authorization': 'Bearer ' + userToken
            }
        })
            .then(() => {
                throw new Error('Test failed');
            })
            .catch((err) => {
                console.log(JSON.stringify(err.response));
                expect(err.response.status).toBe(422);
            })
            .then(() => {
                done();
            })
    });

    it('Update with providing empty password(error scenario)', async done => {
        axios.put(getURL('/user'), {...mockNewUserData, lastName: ''}, {
            headers: {
                'Authorization': 'Bearer ' + userToken
            }
        })
            .then(() => {
                throw new Error('Test failed');
            })
            .catch((err) => {
                console.log(JSON.stringify(err.response));
                expect(err.response.status).toBe(422);
            })
            .then(() => {
                done();
            })
    });
});



/**
 * Tests for Delete
 */
describe('Delete user', () => {
    beforeEach(() => {
        jest.resetModules();
        process.env = {JWT_SECRET: '123Abc123', TEST_URL: testURL};
    });


    it('Delete user by not providing auth token(error scenario)', async done => {
        axios.delete(getURL('/user'))
            .then(() => {
                throw new Error('Test failed');
            })
            .catch((err) => {
                console.log(JSON.stringify(err.response));
                expect(err.response.status).toBe(403);
            })
            .then(() => {
                done();
            })
    });

    it('Delete user providing invalid auth token(error scenario)', async done => {
        axios.delete(getURL('/user'), {
            headers: {
                'Authorization': 'Bearer invalid' + userToken
            }
        })
            .then(() => {
                throw new Error('Test failed');
            })
            .catch((err) => {
                console.log(JSON.stringify(err.response));
                expect(err.response.status).toBe(403);
            })
            .then(() => {
                done();
            })
    });
    it('Delete user', async done => {
        axios.delete(getURL('/user'), {
            headers: {
                'Authorization': 'Bearer ' + userToken
            }
        })
            .then((res) => {
                expect(res.status).toBe(200);
                expect(res.data.data.deletedAt).toBeDefined();
            })
            .catch((err) => {
                console.error(err && err.response && err.response.data ? err.response.data.message : err);
                throw new Error('Test Failed');
            })
            .then(() => {
                done();
            })
    });

});
