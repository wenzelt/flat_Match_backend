"use strict"

import express = require("express")
import middlewares = require("../middleware/authMiddleware")
import offerController = require("../controllers/offerController")

// setting up the express router
export const offerRoute = express.Router()

offerRoute.post('/', middlewares.checkAuthentication, middlewares.checkIsTenant, offerController.createOffer)
offerRoute.get('/getOffers/:userId', middlewares.checkAuthentication, middlewares.checkIsTenant, offerController.getOffers)
offerRoute.get('/getOffers', middlewares.checkAuthentication, middlewares.checkIsTenant, offerController.getOffers)
offerRoute.get('/getFilteredOffers/', middlewares.checkAuthentication, middlewares.checkIsApplicant, offerController.getFilteredOffer)
offerRoute.get('/:id', middlewares.checkAuthentication, offerController.getOffer)
offerRoute.put('/addApplicant/:id', middlewares.checkAuthentication, middlewares.checkIsApplicant, offerController.addApplicant)
offerRoute.put('/addToDeclinedOffer/:id', middlewares.checkAuthentication, middlewares.checkIsApplicant, offerController.addToDeclinedOffer)
offerRoute.put('/addToAcceptedOffer/:id', middlewares.checkAuthentication, middlewares.checkIsApplicant, offerController.addToAcceptedOffer)
offerRoute.put('/removeApplicant/:id', middlewares.checkAuthentication, middlewares.checkIsTenant, offerController.removeApplicant)
offerRoute.put('/:id', middlewares.checkAuthentication, middlewares.checkIsTenant, offerController.updateOffer)
offerRoute.delete('/:id', middlewares.checkAuthentication, middlewares.checkIsTenant, offerController.removeOffer)
// offer pictures
offerRoute.post('/uploadOfferPicture/:id', middlewares.checkAuthentication, offerController.uploadOfferPicture)
offerRoute.get('/getOfferPicture/:fileName', middlewares.checkAuthentication, offerController.getOfferPicture)
offerRoute.get('/getOfferPicturesMetaData/:id', middlewares.checkAuthentication, offerController.getOfferPicturesMetaData)
offerRoute.delete('/deleteOfferPicture/:fileName', middlewares.checkAuthentication, offerController.deleteOfferPicture)