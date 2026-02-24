import express from "express"
import { userRouter } from "./routes/user.routes.js"
import { authenticateUser } from "./middlewares/custom.middleware.js"
import { adminRouter } from "./routes/admin.routes.js"

const app = express()
const PORT = process.env.PORT ?? 8000 

app.use(express.json())
app.use(authenticateUser)

app.get('/test-route', function(req, res){
    return res
        .status(200)
        .json({
            Status: "Success",
            Message: "App is up and running."
        })
})

app.use("/user", userRouter)
app.use("/admin", adminRouter)

app.listen(PORT, function(){
    console.log(`App is running on, PORT: ${PORT}`);  
})