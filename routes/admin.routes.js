import express from "express"
import { deleteUserById, getAllUsers } from "../controllers/admin.controllers.js"
import { authenticateUser, isAuthenticated, isAuthorized } from "../middlewares/custom.middleware.js"

export const adminRouter = express.Router()

const adminAuthorized = isAuthorized("ADMIN")

// Get Request: Get All User From DB
adminRouter.get("/auth/getAllUsers", authenticateUser, isAuthenticated, adminAuthorized, getAllUsers)

// Delete Request: Delete That Particular User
adminRouter.delete("/auth/deleteUser/:userId", authenticateUser, isAuthenticated, adminAuthorized, deleteUserById)