"use strict"

import express = require("express")
import middlewares = require("../middleware/authMiddleware")
import authController = require("../controllers/authController")
import { errorHandler } from "../middleware/errorHandler"
import { greetUser } from "../controllers/indexController"

// setting up the express router
export const authRoute = express.Router()

authRoute.post('/signin', authController.signin)
authRoute.post("/signup", authController.signup)
authRoute.get("/userinfo", middlewares.checkAuthentication, authController.userinfo)
authRoute.get("/logout", middlewares.checkAuthentication, authController.logout)




