# Serverless JWT Auth Boilerplate by Daniel Abib

A [Serverless](https://serverless.com/) REST API boilerplate for authenticating with email/password over JWT (JSON Web Tokens) using
AWS DynamoDB and DynamoDB local as database

In production, it uses:

---

# 0. Installation

```bash
# Install the Serverless CLI
npm install serverless

# Clone the repo
git clone https://github.com/dcabib/serverless-jwt-auth serverless-jwt-auth

# Install dependencies
cd serverless-jwt-auth && npm install

# Install dynamodb local
sls dynamodb install

# Edit (if needed) your environment variables (and update the JWT secret)
(optional) env.prod.yml
```

---

# 1. Usage

### 1.1 Development

You can use Serverless Offline while you develop, which starts a local DynamoDB instance (data is reset on each start)

```bash
npm start

# OR to use env.staging.yml environment variables:
# yarn start --STAGE staging
```

Expected Result: (BE SURE that DynamoDB local is installed and running)

```bash
Dynamodb Local Started, Visit: http://localhost:8000/shell
Serverless: DynamoDB - created table serverless-jwt-auth-test-users
Seed running complete for table: serverless-jwt-auth-test-users
Serverless: Starting Offline: undefined/undefined.

Serverless: Routes for verify-token:
Serverless: (none)

Serverless: Routes for login:
Serverless: POST /login

Serverless: Routes for register:
Serverless: POST /register

Serverless: Routes for user:
Serverless: GET /user
Serverless: Configuring Authorization: user verify-token

Serverless: Routes for userUpdate:
Serverless: PUT /user
Serverless: Configuring Authorization: user verify-token

Serverless: Offline listening on http://localhost:3000
```

# 2. Running Unit Tests

```bash
npm run test (or npm test)
```

Expected Result:

```bash
 PASS  tests/Helpers/Users.test.js
  JWT Tokens
    ✓ should generate token + when decoded, should be equal to input User ID (6 ms)
  User lookup by email
    ✓ should load correct user (1 ms)
    ✓ should return null when not found in DB (1 ms)
  User lookup by ID
    ✓ should load correct user (1 ms)
    ✓ should throw an error when not found in DB (3 ms)

Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total
Snapshots:   0 total
Time:        2.009 s
```

# 3. Running local tests

PRE-REQUISIT: To be able to test locally, be sure that serverless offline and dynamodb local is running as described in step  1.1 Developement

```bash
npm run 
```

Run in another terminal (or using your favorite HTTP Client - Postman for example) the following commands:

You can register a user, login, get user datail, or update user information using following URL:

##  3.1. Register a user

```bash
Request: POST /register
{
  "firstname": "John",
  "lastname": "Smith",
  "email": "john@smith.co",
  "password": "123Abc123"
}
```

```bash
curl --header "Content-Type: application/json" --request POST --data '{"firstName": "John", "lastName": "Smith", "email": "john@smith.com", "password": "123Abc123"}' http://localhost:3000/register 
```

## Response
```bash
{
  "message": "Success - you are now registered",
  "data": {
    "token": "<YOUR-JWT-TOKEN>",
    "firstName": "John",
    "lastName": "Smith",
    "createdAt": 1536717884934,
    "level": "standard",
    "id": "37ff3e00-b630-11e8-b87d-85b1d165e421",
    "email": "john@doe.com",
    "updatedAt": 1536717884934
  }
}
```

## 3.2. Log-in user

```bash
 Request: POST /login

{
  "email": "john@smith.co",
  "password": "123Abc123"
}
```

```bash
curl --header "Content-Type: application/json" --request POST --data '{"email": "john@smith.com", "password": "123Abc123"}' http://localhost:3000/login
```

## Response
```bash
{
  "message": "Success - you are now logged in",
  "data": {
    "token": "<YOUR-JWT-TOKEN>",
    "firstName": "John",
    "lastName": "Smith",
    "createdAt": 1536134110955,
    "level": "standard",
    "id": "03969310-b0e1-11e8-a48b-efa31124d46c",
    "email": "john@doe.com",
    "updatedAt": 1536134110955
  }
}
```

## 3.3. Get User Details

```json
# Request: GET /user
````

```json
curl --header "Content-Type: application/json" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjBkNDE2ZGUwLWU3ZGEtMTFlYS05OWY0LTMzZDlkNWMwNjkwOCIsImVtYWlsIjoiam9obkBzbWl0aC5jb20iLCJpYXQiOjE1OTg0NzM5ODYsImV4cCI6MTU5ODU2MDM4Nn0.R6XDoOoCXRwoblh0YOado6EPsRyTIXKNQdrEy571fYU" --request GET  http://localhost:3000/user 

````

## Response

```json

{
  "message": "Success - user data retrieved",
  "data": {
    "firstName": "John",
    "lastName": "Doe",
    "createdAt": 1536134110955,
    "level": "standard",
    "id": "03969310-b0e1-11e8-a48b-efa31124d46c",
    "email": "john@doe.com",
    "updatedAt": 1536276034130
  }
}
```


## 3.4. Update User Information

```json
Request: PUT /user

{
	"firstName": "Jane",
	"lastName": "Doe",
	"email": "jane@doe.com",
	"password": "123Abc"
}
````

```json
curl --header "Content-Type: application/json" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjBkNDE2ZGUwLWU3ZGEtMTFlYS05OWY0LTMzZDlkNWMwNjkwOCIsImVtYWlsIjoiam9obkBzbWl0aC5jb20iLCJpYXQiOjE1OTg0NzM5ODYsImV4cCI6MTU5ODU2MDM4Nn0.R6XDoOoCXRwoblh0YOado6EPsRyTIXKNQdrEy571fYU" --request PUT --data '{"firstName": "Jane", "lastName": "Doe", "email": "jane@doe.com", "password": "123Abc"}' http://localhost:3000/user
{"message":"Success - user updated","data":{"Attributes":{"createdAt":1598473429999,"firstName":"Jane","lastName":"Doe","password":"$2a$08$tlK.bw02f40fDocsTjkRG.0GVo.anM8SPkh76Fm.ullhBdoHfTg/G","level":"standard","id":"0d416de0-e7da-11ea-99f4-33d9d5c06908","email":"jane@doe.com","updatedAt":1598474658286}}}% 
````

## Response
```json
{
  "message": "Success - user updated",
  "data": {
    "firstName": "Jane",
    "lastName": "Doe",
    "createdAt": 1536134110955,
    "level": "standard",
    "id": "03969310-b0e1-11e8-a48b-efa31124d46c",
    "email": "john@doe.com",
    "updatedAt": 1536276156160
  }
}
```

# 4. Production

__1. Setup your AWS credentials__

_Create a new AWS IAM user and assign the `AdministratorAccess` policy to the new user (later, it's best to reduce the permissions this IAM User has for security reasons)._

```bash
serverless config credentials --provider aws --key <YOUR_AWS_KEY> --secret <YOUR_AWS_SECRET>
```

__2. Then deploy to AWS__

```bash
sls deploy

# OR to use env.dev.yml environment variables:
# sls deploy --STAGE dev
```

---

