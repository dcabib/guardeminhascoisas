var axios = require('axios');
const testURL = 'http://localhost:3000';
// const testURL = 'https://z6f8vj5yb9.execute-api.us-east-1.amazonaws.com/test';


const getURL = (path) =>
    process.env.TEST_URL + path

let userToken; // it will be used to store user token after login to be used in get / udate / delete melhods

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

    it('Should register a user with valid data', async done => {
        axios.post(getURL('/user/register'), mockNewUserData)
            .then((res) => {
                expect(res.status).toBe(201);
            })
            .catch((err) => {
                console.log(JSON.stringify(err));
                throw new Error('Test Failed');
            })
            .then(() => {
                done();
            })
    });

    it('Should not register a user using same email used by another user', async done => {
        axios.post(getURL('/user/register'), mockNewUserData)
            .then((res) => {
                throw new Error('Test Failed');
            })
            .catch((err) => {
                expect(err.response.status).toBe(409);
                return;
            })
            .then(() => {
                done();
            })
    });

    it('Should not register a user without firstname (error scenario)', async done => {
        axios.post(getURL('/user/register'), {
            "lastName": "Smith",
            "email": "test@mail.co",
            "password": "abc113adb"
        })
            .then(() => {
                throw new Error('Test failed');
            })
            .catch((err) => {
                expect(err.response.status).toBe(422);
                expect(err.response.data.data[0].params.missingProperty).toBe('firstName');
            })
            .then(() => {
                done();
            })
    });

    it('Should not register a user  lastname (error scenario)', async done => {
        axios.post(getURL('/user/register'), {
            "firstName": "John",
            "email": "test@mail.co",
            "password": "abc113adb"
        })
            .then(() => {
                throw new Error('Test failed');
            })
            .catch((err) => {
                expect(err.response.status).toBe(422);
                expect(err.response.data.data[0].params.missingProperty).toBe('lastName');
            })
            .then(() => {
                done();
            })
    });

    it('Should not register a user  password (error scenario)', async done => {
        axios.post(getURL('/user/register'), {
            "firstName": "John",
            "lastName": "Smith",
            "email": "test@mail.co",
        })
            .then(() => {
                throw new Error('Test failed');
            })
            .catch((err) => {
                expect(err.response.status).toBe(422);
                expect(err.response.data.data[0].params.missingProperty).toBe('password');
            })
            .then(() => {
                done();
            })
    });

    it('Should not register a user passing invalid JSON (error scenario)', async done => {
        axios.post(getURL('/user/register'), '{"firstName": "John","lastName": "Smith","email": "test@mail.co" "password": "abc123abc"}', {
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(() => {
                throw new Error('Test failed');
            })
            .catch((err) => {
                expect(err.response.status).toBe(400);
            })
            .then(() => {
                done();
            })
    });
});

// /**
//  * Tests for Login
//  */
describe('Login', () => {
    beforeEach(() => { jest.resetModules(); process.env = { JWT_SECRET: '123Abc123', TEST_URL: testURL }; });

    it('Shdould login with valid user information (success scenario)', async done => {
        axios.post(getURL('/user'), {
            "email": mockNewUserData.email,
            "password": mockNewUserData.password
        })
        .then((res) => {
            expect(res.status).toBe(200);
            expect(res.data.data.token).toBeDefined();
            userToken = res.data.data.token;
        })
        .catch((err) => {
            throw new Error('Test Failed');
        })
        .then(() => {
            done();
        })
    });

    it('Shdould not login without email (error scenario)', async done => {
        axios.post(getURL('/user'), {
            "password": mockNewUserData.password
        })
        .then(() => {
            throw new Error('Test failed');
        })
        .catch((err) => {
            expect(err.response.status).toBe(422);
        })
        .then(() => {
            done();
        })
    });

    it('Shdould not login without a valid password (error scenario)', async done => {
        axios.post(getURL('/user'), {
            "email": mockNewUserData.email,
        })
        .then(() => {
            throw new Error('Test failed');
        })
        .catch((err) => {
            expect(err.response.status).toBe(422);
        })
        .then(() => {
            done();
        })
    });

    it('Shdould not login with invalid JSON (error scenario)', async done => {
        axios.post(getURL('/user'), '{"email": "email, "password"= "abc123abc"}', {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(() => {
            throw new Error('Test failed');
        })
        .catch((err) => {
            expect(err.response.status).toBe(400);
        })
        .then(() => {
            done();
        })
    });

    it('hdould not login with unregistered email (error scenario)', async done => {
        axios.post(getURL('/user'), {
            "email": 'invalid' + mockNewUserData.email,
            "password": mockNewUserData.password
        })
            .then(() => {
                throw new Error('Test failed');
            })
            .catch((err) => {
                expect(err.response.status).toBe(404);
            })
            .then(() => {
                done();
            })
    });

    it('hdould not login with invalid password (error scenario)', async done => {
        axios.post(getURL('/user'), {
            "email": mockNewUserData.email,
            "password": 'invalid' + mockNewUserData.password
        })
            .then(() => {
                throw new Error('Test failed');
            })
            .catch((err) => {
                expect(err.response.status).toBe(404);
            })
            .then(() => {
                done();
            })
    });
});

/**
 * Tests for GET user
 */
describe('Get user', () => {
    beforeEach(() => { jest.resetModules(); process.env = { JWT_SECRET: '123Abc123', TEST_URL: testURL }; });

    it('Should get user data (sucess scenario)', async done => {
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
            console.log(JSON.stringify(err));
            throw new Error('Test Failed');
        })
        .then(() => {
            done();
        })
    });


    it('Shoud not get user data with invalid auth token (error scenario)', async done => {
        axios.get(getURL('/user'), {
            headers: {
                'Authorization': 'Bearer ' + userToken + "121231233"
            }
        })
        .then(() => {
            throw new Error('Test failed');
        })
        .catch((err) => {
            expect(err.response.status).toBe(403);
        })
        .then(() => {
            done();
        })
    });

    it('Shoud not get user data without auth token(error scenario)', async done => {
        axios.get(getURL('/user'))
        .then(() => {
            throw new Error('Test failed');
        })
        .catch((err) => {
            expect(err.response.status).toBe(401);
        })
        .then(() => {
            done();
        })
    });
});

/**
 * Tests for refreshToken
 */
describe('Refresh token from user', () => {
    beforeEach(() => { jest.resetModules(); process.env = { JWT_SECRET: '123Abc123', TEST_URL: testURL }; });

    it('Should refresh user token (sucess scenario)', async done => {

        // Getting header for Axios / POST
        var headerWithToken = setAxiosToken(userToken);

        axios.post(getURL('/user/refreshtoken'), {
            headers: headerWithToken
        })
        .then((res) => {
            expect(res.status).toBe(200);
            userToken = res.data.data.token;
        })
        .catch((err) => {
            throw new Error('Test Failed');
        })
        .then(() => {
            done();
        })
    });

    it('Shoud not get / refresh user token invalid auth token (error scenario)', async done => {

        // Getting header for Axios / POST
        var headerWithToken = setAxiosToken(userToken + "asdasdasdasd");

        axios.post(getURL('/user/refreshtoken'), {
            headers: headerWithToken
        })
        .then(() => {
            throw new Error('Test failed');
        })
        .catch((err) => {
            expect(err.response.status).toBe(403);
        })
        .then(() => {
            done();
        })
    });

    it('Shoud not get / refresh user data without auth token(error scenario)', async done => {
        // Getting header for Axios / POST
        var headerWithToken = setAxiosToken();

        axios.post(getURL('/user/refreshtoken'), {
            headers: headerWithToken
        })
        .then(() => {
            throw new Error('Test failed');
        })
        .catch((err) => {
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

    it('Should update user informatiomn with valid data (sucess scenario)', async done => {
        axios.put(getURL('/user'), mockUpdatedUserData, {
            headers: {
                'Authorization': 'Bearer ' + userToken
            }
        })
        .then((res) => {
            expect(res.status).toBe(200);
            expect(res.data.data.user.Attributes.firstName).toEqual(mockUpdatedUserData.firstName);
            expect(res.data.data.user.Attributes.lastName).toEqual(mockUpdatedUserData.lastName);
            expect(res.data.data.user.Attributes.email).toEqual(mockUpdatedUserData.email);
        })
        .catch((err) => {
            console.log(JSON.stringify(err));
            throw new Error('Test Failed');
        })
        .then(() => {
            done();
        })
    });

    it('Should update with providing only firstname (succes scenario)', async done => {
        axios.put(getURL('/user'), {
            firstName: mockNewUserData.firstName
        }, {
            headers: {
                'Authorization': 'Bearer ' + userToken
            }
        })
        .then((res) => {
            expect(res.status).toBe(200);
            expect(res.data.data.user.Attributes.firstName).toEqual(mockNewUserData.firstName);
        })
        .catch((err) => {
            console.log(JSON.stringify(err));
            throw new Error('Test Failed');
        })
        .then(() => {
            done();
        })
    });

    it('Should update with providing only lastname (success scenario)', async done => {
        axios.put(getURL('/user'), {
            lastName: mockNewUserData.lastName
        }, {
            headers: {
                'Authorization': 'Bearer ' + userToken
            }
        })
        .then((res) => {
            expect(res.status).toBe(200);
            expect(res.data.data.user.Attributes.lastName).toEqual(mockNewUserData.lastName);
        })
        .catch((err) => {
            console.log(JSON.stringify(err));
            throw new Error('Test Failed');
        })
        .then(() => {
            done();
        })
    });

    it('Should update with providing only password (success scenario)', async done => {
        axios.put(getURL('/user'), {
            password: mockNewUserData.password
        }, {
            headers: {
                'Authorization': 'Bearer ' + userToken
            }
        })
        .then((res) => {
            expect(res.status).toBe(200);
            expect(res.data.data.user.Attributes.lastName).toEqual(mockNewUserData.lastName);
        })
        .catch((err) => {
            console.log(JSON.stringify(err));
            throw new Error('Test Failed');
        })
        .then(() => {
            done();
        })
    });

    it('Should not update with providing invalid auth token (error scenario)', async done => {
        axios.put(getURL('/user'), mockNewUserData, {
            headers: {
                'Authorization': 'Bearer ' + userToken + "123123"
            }
        })
        .then(() => {
            throw new Error('Test failed');
        })
        .catch((err) => {
            expect(err.response.status).toBe(403);
        })
        .then(() => {
            done();
        })
    });

    it('Should not update with providing invalid email (error scenario)', async done => {
        axios.put(getURL('/user'), {...mockNewUserData, email: 'invalid'}, {
            headers: {
                'Authorization': 'Bearer ' + userToken
            }
        })
        .then(() => {
            throw new Error('Test failed');
        })
        .catch((err) => {
            expect(err.response.status).toBe(422);
        })
        .then(() => {
            done();
        })
    });

    it('Should not update with providing empty firstName(error scenario)', async done => {
        axios.put(getURL('/user'), {...mockNewUserData, firstName: ''}, {
            headers: {
                'Authorization': 'Bearer ' + userToken
            }
        })
            .then(() => {
                throw new Error('Test failed');
            })
            .catch((err) => {
                expect(err.response.status).toBe(422);
            })
            .then(() => {
                done();
            })
    });

    it('Should not update with providing empty lastName (error scenario)', async done => {
        axios.put(getURL('/user'), {...mockNewUserData, lastName: ''}, {
            headers: {
                'Authorization': 'Bearer ' + userToken
            }
        })
        .then(() => {
            throw new Error('Test failed');
        })
        .catch((err) => {
            expect(err.response.status).toBe(422);
        })
        .then(() => {
            done();
        })
    });

    it('Should not update with providing empty lastName (error scenario)', async done => {
        axios.put(getURL('/user'), {...mockNewUserData, lastName: ''}, {
            headers: {
                'Authorization': 'Bearer ' + userToken
            }
        })
        .then(() => {
            throw new Error('Test failed');
        })
        .catch((err) => {
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


    it('Should not delete user by not providing auth token (error scenario)', async done => {
        axios.delete(getURL('/user'))
            .then(() => {
                throw new Error('Test failed');
            })
            .catch((err) => {
                expect(err.response.status).toBe(403);
            })
            .then(() => {
                done();
            })
    });

    it('Should not delete user providing invalid auth token(error scenario)', async done => {
        axios.delete(getURL('/user'), {
            headers: {
                'Authorization': 'Bearer ' + userToken + "123" 
            }
        })
        .then(() => {
            throw new Error('Test failed');
        })
        .catch((err) => {
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
        })
        .catch((err) => {
            console.log(JSON.stringify(err));
            throw new Error('Test Failed');
        })
        .then(() => {
            done();
        })
    });
});

/*
/ Auxiliar function to set header from Axios for POST
*/
exports.modules = setAxiosToken = (token) => {
    // Chedk if no token was provided 
    if (!token)
        token = '';

    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    axios.defaults.headers.post['Content-Type'] = 'application/json; charset=utf-8'
}