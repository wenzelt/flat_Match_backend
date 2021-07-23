"use strict"

import express = require("express")
import middlewares = require("../middleware/authMiddleware")
import authController = require("../controllers/authController")

// setting up the express router
export const authRoute = express.Router()

authRoute.post('/signin', authController.signin)
authRoute.post("/signup", authController.signup)
authRoute.get("/email/:email", authController.isEmailAvailable)
authRoute.get("/user", middlewares.checkAuthentication, authController.getUser)
authRoute.get("/:email", middlewares.checkAuthentication, authController.getUserByMail)
authRoute.get("/logout", middlewares.checkAuthentication, authController.logout)
authRoute.put("/user", middlewares.checkAuthentication, authController.updateUser)





