"use strict"

import express = require("express")
import middlewares = require("../middleware/authMiddleware")
import offerController = require("../controllers/offerController")

// setting up the express router
export const offerRoute = express.Router()

offerRoute.post('/', middlewares.checkAuthentication, middlewares.checkIsTenant, offerController.createOffer)
offerRoute.get('/getOffers', middlewares.checkAuthentication, middlewares.checkIsTenant, offerController.getOffers)
offerRoute.get('/:id', middlewares.checkAuthentication, middlewares.checkIsTenant, offerController.getOffer)
offerRoute.get('/getFilteredOffers/:id', middlewares.checkAuthentication, middlewares.checkIsApplicant, offerController.getFilteredOffer)
offerRoute.put('/:id', middlewares.checkAuthentication, middlewares.checkIsTenant, offerController.updateOffer)
offerRoute.delete('/:id', middlewares.checkAuthentication, middlewares.checkIsTenant, offerController.removeOffer)