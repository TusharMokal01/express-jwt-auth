import express from "express"
import { registerUser, userLogin, getMyDetails, updateUserDetails, userLogout } from "../controllers/user.controllers.js"
import { isAuthenticated } from "../middlewares/custom.middleware.js"

export const userRouter = express.Router()

// Post Route: Register User
userRouter.post("/auth/registerUser", registerUser)

// Post Route: User Login
userRouter.post("/auth/login", userLogin)

// Post Route: User Logout
userRouter.post("/auth/logout", userLogout)

// GET Route: Get My Details
userRouter.get("/auth/me", isAuthenticated, getMyDetails)

// PATCH Route: Update User Details
userRouter.patch("/auth/updateDetails", isAuthenticated, updateUserDetails)