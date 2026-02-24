# Stateless Authentication

## Overview

This application is built using Express and implements stateless authentication using JSON Web Tokens (JWT).

Features:

- User registration
- User login (JWT token generation)
- User logout (client-side token removal)
- Get authenticated user details
- Update user details
- Admin-only routes
- Role-based authorization
- PostgreSQL database (via Docker)
- Drizzle ORM for database queries

The server runs on:

```

PORT = process.env.PORT ?? 8000

```

---

# Database (Docker)

PostgreSQL is configured using Docker.

## Docker Service

- Image: `postgres:17.4`
- Port: `5432:5432`
- Volume: `db_data:/var/lib/postgresql/data`

## Volume

```

db_data:

````

Docker is used to spin up the PostgreSQL database.

---

# Global Middleware

## `authenticateUser`

- Reads `Authorization` header.
- Requires format: `Bearer <token>`.
- Verifies token using `jwt.verify`.
- Attaches decoded payload to `req.user`.
- Returns:
  - `400` → Invalid Authorization header format
  - `401` → Token missing / Invalid or expired token

Applied globally using:

```js
app.use(authenticateUser)
````

---

# Test Route

## GET `/test-route`

**Response**

```json
{
  "Status": "Success",
  "Message": "App is up and running."
}
```

---

# User Routes (`/user`)

## POST `/user/auth/registerUser`

Controller: `registerUser`

* Validates request body using schema.
* Checks for existing user by email.
* Hashes password using `crypto` (HMAC SHA256 with salt).
* Inserts new user into database.

**Responses**

* `400` → Validation error / User already exists
* `201` → User created successfully

---

## POST `/user/auth/login`

Controller: `userLogin`

* Validates request body using schema.
* Verifies email and password.
* Generates JWT token using `jwt.sign`.

**Token Payload**

* `userId`
* `firstName`
* `lastName`
* `role`

**Responses**

* `400` → Validation error
* `404` → User not found
* `401` → Incorrect password
* `200` → Returns token

---

## POST `/user/auth/logout`

Controller: `userLogout`

Stateless logout.

**Response**

* `200` → Client should delete token

---

## GET `/user/auth/me`

Middleware:

* `isAuthenticated`

Controller:

* `getMyDetails`

Returns authenticated user from `req.user`.

**Responses**

* `401` → Unauthorized
* `200` → User details

---

## PATCH `/user/auth/updateDetails`

Middleware:

* `isAuthenticated`

Controller:

* `updateUserDetails`

* Validates request body.

* Updates provided fields only.

* Re-hashes password if updated.

* Updates record using `req.user.userId`.

**Responses**

* `400` → Validation error / No valid fields
* `200` → User updated successfully
* `500` → Internal Server Error

---

# Admin Routes (`/admin`)

All admin routes require:

* `authenticateUser`
* `isAuthenticated`
* `isAuthorized("ADMIN")`

---

## GET `/admin/auth/getAllUsers`

Controller:

* `getAllUsers`

Returns all users.

**Response**

* `200` → List of users

---

## DELETE `/admin/auth/deleteUser/:userId`

Controller:

* `deleteUserById`

Deletes user by `userId` from route params.

**Response**

* `200` → User deleted successfully

---

# Middlewares

## `isAuthenticated`

* Ensures `req.user` exists.
* Returns:

  * `401` → Unauthorized Access

---

## `isAuthorized(role)`

* Compares `req.user.role` with required role.
* Returns:

  * `403` → Access Forbidden

---

# Database Model

## `userTable` (users)

Columns:

* `id` (UUID, primary key)
* `firstName`
* `lastName`
* `email` (unique)
* `role` (`ADMIN`, `MODERATOR`, `USER`) — default `USER`
* `password`
* `salt`
* `createdAt`
* `updatedAt`

---

# Authentication Flow

1. User registers.
2. User logs in.
3. Server verifies credentials.
4. Server generates JWT token.
5. Client sends token in:

   ```
   Authorization: Bearer <token>
   ```
6. `authenticateUser` verifies token on protected routes.
7. Decoded payload is attached to `req.user`.

---

# Password Handling

* Passwords are hashed using:

  * `crypto.createHmac("sha256", salt)`
* A unique salt is generated using:

  * `randomBytes(16)`
* Salt and hashed password are stored in the database.

---

# Role-Based Access

Available roles:

* `ADMIN`
* `MODERATOR`
* `USER`

Admin routes require:

```
isAuthorized("ADMIN")
```
