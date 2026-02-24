import { eq } from "drizzle-orm"
import { db } from "../db/index.js"
import { userTable } from "../models/users.schema.js"


export const getAllUsers = async function (req, res) {
    const users = await db
        .select()
        .from(userTable)

    return res
        .status(200)
        .json({
            Users: users
        })
}

export const deleteUserById = async function (req, res) {
    const userId = req.params.userId
    console.log("User Id: ", userId);

    const result = await db
        .delete(userTable)
        .where(eq(userTable.id, userId))
        .returning({
            userId: userTable.id
        })

    console.log("Result: ", result);

    return res
        .status(200)
        .json({
            Status: `Success`,
            Message: `User with, User Id: ${userId} deleted successfully.`
        })
}