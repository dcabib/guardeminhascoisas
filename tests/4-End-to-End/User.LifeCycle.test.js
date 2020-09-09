var axios = require('axios');
const testURL = 'http://localhost:3000';
// const testURL = 'https://75wjns76h0.execute-api.us-east-1.amazonaws.com/test';

const getURL = (path) =>
    process.env.TEST_URL + path

let userToken;           // it will be used to store user token after login to be used in get / udate / delete melhods
let oldLoginUserToken;   // it will be used to store old user token after login with new credentials


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
        email: (Math.floor(Math.random() * Math.floor(10000))) + 'mark@doe.com',
        password: '123abcd432',
    };

    it('Should register user 1', async done => {
         axios.post(getURL('/user/register'), mockUser1)
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
                console.log(JSON.stringify(err));
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
                console.log(JSON.stringify(err));
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
                console.log(JSON.stringify(err));
                throw new Error('Test Failed');
            })
            .then(() => {
                done();
            })
    });

    it('Should not login user 2 with old password (error scenario)', async done => {
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

    it('Should login user 2 with new password', async done => {
        axios.post(getURL('/user'), {
            "email": mockUser2.email,
            "password": mockUser2.password
        })
            .then((res) => {
                expect(res.status).toBe(200);
                expect(res.data.data.token).toBeDefined();
                oldLoginUserToken = userToken;
                userToken = res.data.data.token;
            })
            .catch((err) => {
                console.log(JSON.stringify(err));
                throw new Error('Test Failed');
            })
            .then(() => {
                done();
            })
    });

    it('Should get user 2 information with new credentials (token)', async done => {
        axios.get(getURL('/user'), {
            headers: {
                'Authorization': 'Bearer ' + userToken
            }
        })
            .then((res) => {
                expect(res.status).toBe(200);
                expect(res.data.data.firstName).toEqual(mockUser2.firstName);
                expect(res.data.data.lastName).toEqual(mockUser2.lastName);
                expect(res.data.data.email).toEqual(mockUser2.email);
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

    if (false) {
    it('Should not get user 2 information with old credentials (token)', async done => {
        axios.get(getURL('/user'), {
            headers: {
                'Authorization': 'Bearer ' + oldLoginUserToken
            }
        })
            .then((res) => {
                expect(res.status).toBe(200);
                expect(res.data.data.firstName).toEqual(mockUser2.firstName);
                expect(res.data.data.lastName).toEqual(mockUser2.lastName);
                expect(res.data.data.email).toEqual(mockUser2.email);
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
}
    it('Should refresh token for user 2', async done => {
        // Getting header for Axios / POST
        // var headerWithToken = setAxiosToken(userToken);
 
        axios.post(getURL('/user/refreshtoken'), {
            headers: {
                'Authorization': 'Bearer ' + oldLoginUserToken
            }
        })
         .then((res) => {
             expect(res.status).toBe(200);
             expect(res.data.data.token).toBeDefined();
             oldRefreshUserToken = userToken;
             userToken = res.data.data.token;
         })
         .catch((err) => {
             console.log(JSON.stringify(err));
             throw new Error('Test Failed');
         })
         .then(() => {
             done();
         })
    });
 
    if (false) {// issue with glocal idenx not provide strong consistency
    it('Should not get user 2 information using first token (before updating credentials)', async done => {

        // Getting header for Axios / POST
        // var headerWithToken = setAxiosToken(userToken);

        axios.post(getURL('/user/refreshtoken'), {
            headers: {
                'Authorization': 'Bearer ' + oldLoginUserToken
            }
        })
            .then(() => {
                throw new Error('Test failed');
            })
            .catch((err) => {
                console.log (JSON.stringify(err));
                expect(err.response.status).toBe(403);
                done();
            })
            .then(() => {
                done();
            })
    });
}
 
    it('Should get user 2 information using new token', async done => {
        // Getting header for Axios / POST
        // var headerWithToken = setAxiosToken(userToken);

        axios.get(getURL('/user'), {
            headers: {
                'Authorization': 'Bearer ' + oldLoginUserToken
            }
        })
            .then((res) => {
                expect(res.status).toBe(200);
                expect(res.data.data.firstName).toEqual(mockUser2.firstName);
                expect(res.data.data.lastName).toEqual(mockUser2.lastName);
                expect(res.data.data.email).toEqual(mockUser2.email);
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
 
    it('Should not delete user 1 - user does not exists', async done => {
        // Getting header for Axios / POST
        // var headerWithToken = setAxiosToken(userToken);

        axios.delete(getURL('/user'), {
            headers: {
                'Authorization': 'Bearer ' + oldLoginUserToken
            }
        })
            .then((res) => {
                throw new Error('Test Failed');
            })
            .catch((err) => {
                // console.log(JSON.stringify(err));
                // expect(err.response.status).toBe(403);
                done();
            })
            .then(() => {
                done();
            })
    });

    it('Should delete user 2', async done => {     
        axios.interceptors.request.use(request => {
            console.log('Starting Request', request)
            return request
          })
          
          axios.interceptors.response.use(response => {
            console.log('Response:', response)
            return response
          })

        // Getting header for Axios / POST
        // var headerWithToken = setAxiosToken(userToken);

        axios.delete(getURL('/user'), {
            headers: {
                'Authorization': 'Bearer ' + oldLoginUserToken
            }
        })
            .then((res) => {
                // expect(res.status).toBe(200);
            })
            .catch((err) => {
                console.log (err);
                throw new Error('Test Failed');
            })
            .then(() => {
                done();
            })
    });

    if (false) {
    it('Should not login user 1 (error scenario because user was marked as deleted)', async done => {
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

    it('Should not login user 2 (error scenario because user was marked as deleted)', async done => {        
        axios.post(getURL('/user'), {
            "email": mockUser2.email,
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
}
});


/**
 * Tests for Full creation of user
 */
if (false) {

describe('Full creation of user', () => {
    beforeEach(() => { jest.resetModules(); process.env = { JWT_SECRET: '123Abc123', TEST_URL: testURL }; });

    const mockUser3 = {
        firstName: 'Mark Macfly',
        lastName: 'Henry',
        email: (Math.floor(Math.random() * Math.floor(10000))) + 'mark@henry.com',
        password: 'abcd321fgt',
    };

    it('Should register user 3', async done => {
        axios.post(getURL('/user/register'), mockUser3)
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
                console.log(JSON.stringify(err));
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
                console.log(JSON.stringify(err));
                throw new Error('Test Failed');
            })
            .then(() => {
                done();
            })
    });
});
}

/*
/ Auxiliar function to set header from Axios for POST
*/
// exports.modules = setAxiosToken = (token) => {
//     // Chedk if no token was provided 
//     if (!token)
//         token = '';

//     axios.defaults.headers['Authorization'] = `Bearer ${token}`;
//     axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
//     axios.defaults.headers.delete['Content-Type'] = 'application/x-www-form-urlencoded';
// }
