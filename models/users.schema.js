import {pgTable, pgEnum, varchar, uuid, text, timestamp} from "drizzle-orm/pg-core"

export const userRoleEnum = pgEnum("user_role", ["ADMIN", "MODERATOR", "USER"])

export const userTable = pgTable("users", {
    id: uuid("user_id").primaryKey().defaultRandom(),

    firstName: varchar("first_name", {length: 55}).notNull(),
    lastName: varchar("last_name", {length: 55}),

    email: varchar("user_email", {length: 255}).notNull().unique(),

    role: userRoleEnum().default("USER").notNull(),

    password: text("user_password").notNull(),
    salt: text("user_salt").notNull(),

    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().$onUpdate(() => new Date()).notNull()
})