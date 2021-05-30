import express from "express"

import { errorHandler } from "./../middleware/errorHandler"
import { greetUser } from "./../controllers/indexController"

// setting up the express router
export const indexRoute = express.Router()

// define a route handler for the /api route using the errorHandler middleware
indexRoute.get('/', errorHandler(greetUser))
indexRoute.get('/api', errorHandler(greetUser))