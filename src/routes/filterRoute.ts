"use strict"

import express = require("express")
import middlewares = require("../middleware/authMiddleware")
import filterController = require("../controllers/filterController")

// setting up the express router
export const filterRoute = express.Router()

filterRoute.get('/', middlewares.checkAuthentication, middlewares.checkIsApplicant, filterController.getFilter)
filterRoute.post('/', middlewares.checkAuthentication, middlewares.checkIsApplicant, filterController.createFilter)
filterRoute.put('/', middlewares.checkAuthentication, middlewares.checkIsApplicant, filterController.updateFilter)