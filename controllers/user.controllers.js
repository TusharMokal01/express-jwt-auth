import { registerUserPostRequestValidationSchema, updateUserDetailsPatchRequestValidationSchema, userLoginPostRequestValidationSchema} from "../validation schema/user.validation.schema.js"
import {db} from "../db/index.js"
import {userTable} from "../models/users.schema.js"
import { eq } from "drizzle-orm"
import { createHmac, randomBytes } from "crypto"
import jwt from "jsonwebtoken"

export const registerUser = async function (req, res) {
    const validationResult = await registerUserPostRequestValidationSchema.safeParseAsync(req.body)
    console.log("Validation Result: ", validationResult);

    if(!validationResult.success){
        return res
            .status(400)
            .json({
                Error: validationResult.error.format()
            })
    }

    const {firstName, lastName, email, password} = validationResult.data

    const [existingUser] = await db
        .select({email: userTable.email})
        .from(userTable)
        .where(eq(userTable.email, email))

    console.log("Existing User: ", existingUser);

    if(existingUser){
        return res
            .status(400)
            .json({
                Status: "",
                Error: `User with, Email: ${email} already exist.`
            })
    }

    const salt = randomBytes(16)
        .toString("hex")

    console.log("Salt: ", salt);
    

    const hashedPassword = createHmac("sha256", salt)
        .update(password)
        .digest("hex")

    console.log("Hashed Password: ", hashedPassword);
    
    const [newUser] = await db
        .insert(userTable)
        .values({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            salt
        })
        .returning({
            userId: userTable.id
        })

    console.log("New User: ", newUser);

    return res
        .status(201)
        .json({
            Status: "Success",
            Message: `User with, User Id: ${newUser.userId} created successfully.`
        })
}

export const userLogin = async function (req, res) {
    const validationResult = await userLoginPostRequestValidationSchema.safeParseAsync(req.body)
    console.log("Validation Result: ", validationResult);

    if(!validationResult.success){
        return res
            .status(400)
            .json({
                Error: validationResult.error.format()
            })
    }

    const {email, password} = validationResult.data

    const [existingUser] = await db
        .select({
            userId: userTable.id,
            firstName: userTable.firstName,
            lastName: userTable.lastName,
            email: userTable.email,
            role: userTable.role,
            password: userTable.password,
            salt: userTable.salt
        })
        .from(userTable)
        .where(eq(userTable.email, email))

    console.log("Existing User: ", existingUser);

    if(!existingUser){
        return res
            .status(404)
            .json({
                Stauts: "User Not Found",
                Error: `User with, Email: ${email} does not exist.`
            })
    }

    const verifyPassword = createHmac("sha256", existingUser.salt)
        .update(password)
        .digest("hex")

    console.log("Existing User Password: ", existingUser.password);
    console.log("Verified Password: ", verifyPassword);

    if(existingUser.password != verifyPassword){
        return res
            .status(401)
            .json({
                Status: "Unauthorized Access",
                Error: `Incorrect Password`
            })
    }

    const payLoad = {
        userId: existingUser.userId,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        role: existingUser.role
    }

    const token = jwt.sign(payLoad, process.env.JWT_SECRET)
    console.log("Token: ", token);

    return res
        .status(200)
        .json({
            Status: "Access Granted",
            Message: `User Id: ${existingUser.userId}, Token: ${token}`
        })
}

export const userLogout = async function (req, res) {
    return res.status(200).json({
        status: "Logged out",
        message: "Please delete the token on the client",
    })
}


export const getMyDetails = async function (req, res) {
    return res
        .status(200)
        .json({
            User: req.user
        })
}

export const updateUserDetails = async function (req, res) {
    try {
        const validationResult =
            await updateUserDetailsPatchRequestValidationSchema.safeParseAsync(req.body)

        if (!validationResult.success) {
            return res.status(400).json({
                error: validationResult.error.format(),
            })
        }

        const { firstName, lastName, email, password } = validationResult.data

        
        const updateData = {}

        if (firstName !== undefined) updateData.firstName = firstName
        if (lastName !== undefined) updateData.lastName = lastName

        if (email !== undefined) updateData.email = email

        if (password !== undefined){
            const salt = randomBytes(16).toString("hex")
            const hashedPassword = createHmac("sha256", salt)
                .update(password)
                .digest("hex")

            updateData.password = hashedPassword
            updateData.salt = salt
        }

       
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                error: "No valid fields provided for update",
            })
        }

        const result = await db
            .update(userTable)
            .set(updateData)
            .where(eq(userTable.id, req.user.userId))

        return res.status(200).json({
            message: "User details updated successfully",
            result,
        })
    } catch (error) {
        console.error("Update user details error:", error)

        return res.status(500).json({
            error: "Internal Server Error",
        })
    }
}