var axios = require('axios');
const testURL = 'http://localhost:3000';
const getURL = (path) =>
    process.env.TEST_URL + path
let userToken



/**
 * Tests for Full lifecycle of user
 */
describe('Full lifecycle of user', () => {
    beforeEach(() => { jest.resetModules(); process.env = { JWT_SECRET: '123Abc123', TEST_URL: testURL }; });

    const mockNewUserData = {
        firstName: 'John',
        lastName: 'Doe',
        email: (Math.floor(Math.random() * Math.floor(10000))) + 'john@doe.com',
        password: 'abc113adb',
    };

    const mockUpdatedUserData = {
        firstName: 'John',
        lastName: 'Smith',
        email: mockNewUserData.email,
        password: '123abcd432',
    };

    it('User register', async done => {
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


    it('Login user', async done => {
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

    it('Get user', async done => {
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

    it('Update user (FistName, LastName and Password)', async done => {
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


    it('Login user (with old password - error scenario)', async done => {
        axios.post(getURL('/login'), {
            "email": mockNewUserData.email,
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

    it('Login user (with new password)', async done => {
        axios.post(getURL('/login'), {
            "email": mockNewUserData.email,
            "password": mockUpdatedUserData.password
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

    it('Login user (error scenario because user was marked as deleted)', async done => {
        axios.post(getURL('/login'), {
            "email": mockNewUserData.email,
            "password": mockUpdatedUserData.password
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
 * Tests for Full creation of user
 */
describe('Full creation of user', () => {
    beforeEach(() => { jest.resetModules(); process.env = { JWT_SECRET: '123Abc123', TEST_URL: testURL }; });

    const mockNewUserData = {
        firstName: 'Mark',
        lastName: 'Henry',
        email: (Math.floor(Math.random() * Math.floor(10000))) + 'mark@henry.com',
        password: 'abcd321fgt',
    };


    it('User register', async done => {
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


    it('Login user', async done => {
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

    it('Get user', async done => {
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

});

