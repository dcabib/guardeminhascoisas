var axios = require('axios');
const testURL = 'http://localhost:3000';

const getURL = (path) =>
    process.env.TEST_URL + path

let userToken;

/**
 * Tests for Full lifecycle of user
 */
describe('Full lifecycle of user', () => {
    beforeEach(() => { jest.resetModules(); process.env = { JWT_SECRET: '123Abc123', TEST_URL: testURL }; });

    const mockUser1 = {
        firstName: 'John',
        lastName: 'Doe',
        email: (Math.floor(Math.random() * Math.floor(10000))) + 'john@doe.com',
        password: 'abc113adb',
    };

    const mockUser2 = {
        firstName: 'Mark',
        lastName: 'Smith',
        email: mockUser1.email,
        password: '123abcd432',
    };

    it('Should register user 1', async done => {
        await axios.post(getURL('/register'), mockUser1)
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

    it('Should login with user 1', async done => {
        axios.post(getURL('/user'), {
            "email": mockUser1.email,
            "password": mockUser1.password
        })
            .then((res) => {
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

    it('Should get user 1 information', async done => {
        axios.get(getURL('/user'), {
            headers: {
                'Authorization': 'Bearer ' + userToken
            }
        })
            .then((res) => {
                expect(res.status).toBe(200);
                expect(res.data.data.firstName).toEqual(mockUser1.firstName);
                expect(res.data.data.lastName).toEqual(mockUser1.lastName);
                expect(res.data.data.email).toEqual(mockUser1.email);
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

    it('Should update user 1 (FistName, LastName and Password)', async done => {
        axios.put(getURL('/user'), mockUser2, {
            headers: {
                'Authorization': 'Bearer ' + userToken
            }
        })
            .then((res) => {
                expect(res.status).toBe(200);
                expect(res.data.data.user.Attributes.firstName).toEqual(mockUser2.firstName);
                expect(res.data.data.user.Attributes.lastName).toEqual(mockUser2.lastName);
                expect(res.data.data.user.Attributes.email).toEqual(mockUser2.email);
            })
            .catch((err) => {
                console.error(err && err.response && err.response.data ? err.response.data.message : err);
                throw new Error('Test Failed');
            })
            .then(() => {
                done();
            })
    });

    it('Should not login user 1 with old password (error scenario)', async done => {
        axios.post(getURL('/user'), {
            "email": mockUser1.email,
            "password": mockUser1.password
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

    it('Should login user 1 with new password', async done => {
        axios.post(getURL('/user'), {
            "email": mockUser1.email,
            "password": mockUser2.password
        })
            .then((res) => {
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

    it('Should delete user 1', async done => {
        axios.delete(getURL('/user'), {
            headers: {
                'Authorization': 'Bearer ' + userToken
            }
        })
            .then((res) => {
                expect(res.status).toBe(200);
            })
            .catch((err) => {
                console.error(err && err.response && err.response.data ? err.response.data.message : err);
                throw new Error('Test Failed');
            })
            .then(() => {
                done();
            })
    });

    it('Should not login user 1 (error scenario because user was marked as deleted)', async done => {
        axios.post(getURL('/login'), {
            "email": mockUser1.email,
            "password": mockUser2.password
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
 * Tests for Full creation of user
 */
describe('Full creation of user', () => {
    beforeEach(() => { jest.resetModules(); process.env = { JWT_SECRET: '123Abc123', TEST_URL: testURL }; });

    const mockUser3 = {
        firstName: 'Mark Macfly',
        lastName: 'Henry',
        email: (Math.floor(Math.random() * Math.floor(10000))) + 'mark@henry.com',
        password: 'abcd321fgt',
    };

    it('Should register user 3', async done => {
        axios.post(getURL('/register'), mockUser3)
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


    it('Should login user 3', async done => {
        axios.post(getURL('/user'), {
            "email": mockUser3.email,
            "password": mockUser3.password
        })
            .then((res) => {
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

    it('Should get information of user 3', async done => {
        axios.get(getURL('/user'), {
            headers: {
                'Authorization': 'Bearer ' + userToken
            }
        })
            .then((res) => {
                expect(res.status).toBe(200);
                expect(res.data.data.firstName).toEqual(mockUser3.firstName);
                expect(res.data.data.lastName).toEqual(mockUser3.lastName);
                expect(res.data.data.email).toEqual(mockUser3.email);
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

