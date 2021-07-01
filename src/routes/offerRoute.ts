"use strict"

import express = require("express")
import middlewares = require("../middleware/authMiddleware")
import offerController = require("../controllers/offerController")

// setting up the express router
export const offerRoute = express.Router()

offerRoute.post('/createOffer', middlewares.checkAuthentication, offerController.createOffer)
offerRoute.get("/readOffer", middlewares.checkAuthentication, offerController.getOffer)
offerRoute.put("/updateOffer", middlewares.checkAuthentication, offerController.updateOffer)
offerRoute.delete("/removeOffer", middlewares.checkAuthentication, offerController.removeOffer)