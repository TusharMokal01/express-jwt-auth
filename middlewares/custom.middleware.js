import jwt from "jsonwebtoken"

export const authenticateUser = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization
        console.log("Auth Header:", authHeader)

        if (!authHeader) return next()

        if (!authHeader.startsWith("Bearer ")) {
            return res.status(400).json({
                error: 'Authorization header must start with "Bearer "'
            })
        }

        const token = authHeader.split(" ")[1]
        console.log("Authorization Token:", token)

        if (!token) {
            return res.status(401).json({
                error: "Token missing"
            })
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
        console.log("Decoded Token:", decodedToken)

        req.user = decodedToken
        next()
    } catch (error) {
        console.error("Auth Error:", error)

        return res.status(401).json({
            error: "Invalid or expired token"
        })
    }
}

export const isAuthenticated = async function (req, res, next) {
    const user = req.user
    console.log("User: ", user);

    if(!user){
        return res
            .status(401)
            .json({
                Status: "Unauthorized Access",
                Error: "Incorrect Password"
            })
    }
    next()
}

export const isAuthorized = function (role){
    return async function (req, res, next) {
        if(req.user.role != role){
            return res
                .status(403)
                .json({
                    Status: "Access Forbidden",
                    Error: `You are not authorized to acess this route`
                })
        }

        next()

    }
}