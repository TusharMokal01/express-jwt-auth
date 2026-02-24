import { email, z } from "zod"

export const registerUserPostRequestValidationSchema = z.object({
    firstName: z.string(),
    lastName: z.string().optional(),

    email: z.string().email(),

    password: z.string().min(8)
})

export const userLoginPostRequestValidationSchema = z.object({
    email: z.string().email(),

    password: z.string()
})

export const updateUserDetailsPatchRequestValidationSchema = z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email().optional(),
    password: z.string().optional()
})