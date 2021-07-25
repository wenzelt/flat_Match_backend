"use strict"

import express = require("express")
import middlewares = require("../middleware/authMiddleware")
import profileController = require("../controllers/profileController")

// setting up the express router
export const profileRoute = express.Router()

profileRoute.post('/uploadProfilePicture', middlewares.checkAuthentication, profileController.uploadProfilePicture)
profileRoute.get('/getProfilePicture/:fileName', middlewares.checkAuthentication, profileController.getProfilePicture)
profileRoute.get('/getProfilePictureMetaData/:userId', middlewares.checkAuthentication, profileController.getProfilePictureMetaDataOfUser)
profileRoute.get('/getProfilePictureMetaData', middlewares.checkAuthentication, profileController.getProfilePictureMetaData)
profileRoute.delete('/deleteProfilePicture/:fileName', middlewares.checkAuthentication, profileController.deleteProfilePicture)