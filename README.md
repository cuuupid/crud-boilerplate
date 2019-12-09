# CRUD Boilerplate

A basic CRUD Express+Mongo stack API.

**Routes** - `routes/`

**DB Schemas/Models** - `models/`

**Entrypoint** - `app.js`

Users have a basic model - email, password, and a name. Passwords are hashed with BCrypt.

# API

API Version: `v1`

All endpoints are of form:

`http(s)://<server>:<port>/v1/<route>`

For example running it locally,
`http://localhost:3000/v1/status`

All endpoints return errors in the format:
```
{
    "error": "message"
}
```
Please take note that common HTTP error codes are used.

Basic security is implemented - Helmet and SlowDown on the app, and JWT on the API.

## Endpoints

### Status
- Method: `GET`
- Params: none
- Headers: none
- Path: `/status`

Example:
```
curl --request GET \
  --url http://localhost:3000/v1/status
```

### Create
- Method: `POST`
- Params: email, password, name (in JSON)
- Headers:
    - `Content-Type: application/json`
- Path: `/signup`

Example:
```
curl --request POST \
  --url http://localhost:3000/v1/signup \
  --header 'content-type: application/json' \
  --data '{
	"email": "example1@example.com",
	"password": "password",
	"name": "Example 1"
}'
```

Returns:
```
{
    "success": true
}
```

### Auth
- Method: `POST`
- Params: email, password (in JSON)
- Headers:
    - `Content-Type: application/json`
- Path: `/login`

Example:
```
curl --request POST \
  --url http://localhost:3000/v1/login \
  --header 'content-type: application/json' \
  --data '{
	"email": "example1@example.com",
	"password": "password"
}'
```

Returns:
```
{
  "accessToken": "your token here"
}
```
You can now use this token for further authenticated requests.

### Read
- Method: `POST`
- Params: none
- Headers:
    - `Content-Type: application/json`
    - `x-access-token: your token here`
- Path: `/me`

Example:
```
curl --request POST \
  --url http://localhost:3000/v1/me \
  --header 'x-access-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVkZWRiNTBkMjk4ZTc5MDBjYTgxY2M1YyIsImlhdCI6MTU3NTg1OTU3MiwiZXhwIjoxNTc1OTQ1OTcyfQ.qu51CQ8GidBOk4W--AaKQ96-Fv1XjQ6HXXAcbi2SEBk'
```

Returns:
```
{
  "_id": "5dedb91b298e7900ca81cc5e",
  "email": "example1@example.com",
  "name": "Example 1"
}
```

### Update
- Method: `POST`
- Params: name, email (in JSON) (all optional)
- Headers:
    - `Content-Type: application/json`
    - `x-access-token: your token here`
- Path: `/update`

Example:
```
curl --request POST \
  --url http://localhost:3000/v1/update \
  --header 'content-type: application/json' \
  --header 'x-access-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVkZWRiOTFiMjk4ZTc5MDBjYTgxY2M1ZSIsImlhdCI6MTU3NTg2MDUxMiwiZXhwIjoxNTc1OTQ2OTEyfQ.ssRAlJRghnjkb58Gb3bMq2CpUmF8jrujqKtsCRjwWa4' \
  --data '{
	"name": "Example 2",
	"email": "example2@example.com"
}'
```

Returns:
```
{
  "_id": "5dedb91b298e7900ca81cc5e",
  "email": "example2@example.com",
  "name": "Example 2"
}
```

### Delete
- Method: `POST`
- Params: email, password (in JSON)
- Headers:
    - `Content-Type: application/json`
    - `x-access-token: your token here`
- Path: `/delete`

**Caution: this is permanent!**

Example:
```
curl --request POST \
  --url http://localhost:3000/v1/delete \
  --header 'content-type: application/json' \
  --header 'x-access-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVkZWRiOTFiMjk4ZTc5MDBjYTgxY2M1ZSIsImlhdCI6MTU3NTg2MDUxMiwiZXhwIjoxNTc1OTQ2OTEyfQ.ssRAlJRghnjkb58Gb3bMq2CpUmF8jrujqKtsCRjwWa4' \
  --data '{
	"email": "example1@example.com",
	"password": "password"
}'
```

Returns:
```
{
  "success": true
}
```