"use strict"

import express = require("express")
import middlewares = require("../middleware/authMiddleware")
import matchController = require("../controllers/matchController")

// setting up the express router
export const matchRoute = express.Router()

matchRoute.get('/applicant', middlewares.checkAuthentication, middlewares.checkIsApplicant, matchController.getMatchOfApplicant)
matchRoute.get('/tenant', middlewares.checkAuthentication, middlewares.checkIsTenant, matchController.getMatchOfTenant)
matchRoute.post('/', middlewares.checkAuthentication, middlewares.checkIsTenant, matchController.createMatch)