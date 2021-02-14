const express = require('express')
const {
  getOverview,
  getTour,
  getTourById,
  loginUI
} = require('../Controllers/viewsController')
const {protectRouteMiddleware, isLoggedIn} = require('../Controllers/authenticationController')

const router = express.Router()
//ROUTES FOR PUG RENDERING
router.use(isLoggedIn) //WILL BE APPLIED FOR ALL THE ROUTES BELOW 
router.get('/', getOverview)

router.get('/tours/:tourId',protectRouteMiddleware, getTourById)

router.get('/login', loginUI)
module.exports = router;