# 🔐 Stateless Authentication API (JWT)

A secure **Express.js** backend implementing **stateless authentication** using **JSON Web Tokens (JWT)** with **role-based authorization**, powered by **PostgreSQL (Docker)** and **Drizzle ORM**.

---

## 📌 Overview

This application implements JWT-based authentication and includes:

* ✅ User registration
* ✅ User login (JWT generation)
* ✅ Stateless logout (client-side token removal)
* ✅ Get authenticated user details
* ✅ Update user details
* ✅ Admin-only routes
* ✅ Role-based authorization (RBAC)
* ✅ PostgreSQL database (Dockerized)
* ✅ Drizzle ORM for database queries

---

## 🚀 Server Configuration

The server runs on:

```js
PORT = process.env.PORT ?? 8000
```

---

# 🗄️ Database Setup (Docker)

PostgreSQL is configured using Docker.

## 🐳 Docker Service

* **Image:** `postgres:17.4`
* **Port Mapping:** `5432:5432`
* **Volume:** `db_data:/var/lib/postgresql/data`

### Volume Definition

```yaml
db_data:
```

Docker is used to spin up and persist the PostgreSQL database.

---

# 🌍 Global Middleware

## 🔹 `authenticateUser`

Applied globally:

```js
app.use(authenticateUser)
```

### Responsibilities

* Reads `Authorization` header
* Requires format:

  ```
  Authorization: Bearer <token>
  ```
* Verifies token using `jwt.verify`
* Attaches decoded payload to `req.user`

### Responses

* `400` → Invalid Authorization header format
* `401` → Token missing / Invalid / Expired

---

# 🧪 Test Route

## `GET /test-route`

### ✅ Response

```json
{
  "Status": "Success",
  "Message": "App is up and running."
}
```

---

# 👤 User Routes (`/user`)

---

## 🔹 `POST /user/auth/registerUser`

**Controller:** `registerUser`

### Responsibilities

* Validates request body using schema
* Checks for existing user by email
* Hashes password using `crypto` (HMAC SHA256 + salt)
* Inserts new user into database

### Responses

* `400` → Validation error / User already exists
* `201` → User created successfully

---

## 🔹 `POST /user/auth/login`

**Controller:** `userLogin`

### Responsibilities

* Validates request body
* Verifies email and password
* Generates JWT token using `jwt.sign`

### 🔑 Token Payload

* `userId`
* `firstName`
* `lastName`
* `role`

### Responses

* `400` → Validation error
* `404` → User not found
* `401` → Incorrect password
* `200` → Returns JWT token

---

## 🔹 `POST /user/auth/logout`

**Controller:** `userLogout`

Stateless logout (client deletes token).

### Response

* `200` → Client should delete token

---

## 🔹 `GET /user/auth/me`

**Middleware:**

* `isAuthenticated`

**Controller:**

* `getMyDetails`

Returns authenticated user from `req.user`.

### Responses

* `401` → Unauthorized
* `200` → User details

---

## 🔹 `PATCH /user/auth/updateDetails`

**Middleware:**

* `isAuthenticated`

**Controller:**

* `updateUserDetails`

### Responsibilities

* Validates request body
* Updates only provided fields
* Re-hashes password if updated
* Uses `req.user.userId` for updates

### Responses

* `400` → Validation error / No valid fields
* `200` → User updated successfully
* `500` → Internal Server Error

---

# 👑 Admin Routes (`/admin`)

All admin routes require:

* `authenticateUser`
* `isAuthenticated`
* `isAuthorized("ADMIN")`

---

## 🔹 `GET /admin/auth/getAllUsers`

**Controller:** `getAllUsers`

### Response

* `200` → Returns list of users

---

## 🔹 `DELETE /admin/auth/deleteUser/:userId`

**Controller:** `deleteUserById`

Deletes user using `userId` from route params.

### Response

* `200` → User deleted successfully

---

# 🧩 Middlewares

---

## 🔹 `isAuthenticated`

* Ensures `req.user` exists

### Response

* `401` → Unauthorized Access

---

## 🔹 `isAuthorized(role)`

* Compares `req.user.role` with required role

### Response

* `403` → Access Forbidden

---

# 🗃️ Database Model

## 📄 `userTable` (users)

| Column    | Type / Notes                                   |
| --------- | ---------------------------------------------- |
| id        | UUID (Primary Key)                             |
| firstName | String                                         |
| lastName  | String                                         |
| email     | Unique                                         |
| role      | `ADMIN`, `MODERATOR`, `USER` (default: `USER`) |
| password  | Hashed                                         |
| salt      | String                                         |
| createdAt | Timestamp                                      |
| updatedAt | Timestamp                                      |

---

# 🔄 Authentication Flow

1. User registers
2. User logs in
3. Server verifies credentials
4. Server generates JWT token
5. Client sends token in header:

```
Authorization: Bearer <token>
```

6. `authenticateUser` verifies token on protected routes
7. Decoded payload is attached to `req.user`

---

# 🔐 Password Handling

Passwords are securely stored using:

* `crypto.createHmac("sha256", salt)`
* Unique salt generated via:

  * `randomBytes(16)`

Both salt and hashed password are stored in the database.

---

# 🛡️ Role-Based Access Control

Available roles:

* `ADMIN`
* `MODERATOR`
* `USER`

Admin routes require:

```
isAuthorized("ADMIN")
```

---

# 📌 Summary

This project demonstrates a scalable implementation of:

* Stateless JWT authentication
* Role-based access control (RBAC)
* Global authentication middleware
* Secure password hashing
* Dockerized PostgreSQL setup
* Clean controller-driven architecture

---