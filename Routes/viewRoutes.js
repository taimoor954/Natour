const express = require('express')
const {
  getOverview,
  getTour,
  getTourById,
  loginUI,
  getAccount,
  updateUserData
} = require('../Controllers/viewsController')
const {protectRouteMiddleware, isLoggedIn} = require('../Controllers/authenticationController')

const router = express.Router()
//ROUTES FOR PUG RENDERING
// router.use(isLoggedIn) //WILL BE APPLIED FOR ALL THE ROUTES BELOW 
router.get('/login', isLoggedIn,loginUI)
router.get('/', isLoggedIn, getOverview)
router.get('/tours/:tourId',isLoggedIn, getTourById)
router.get('/me', protectRouteMiddleware,getAccount)
router.post('/submit-user-data', protectRouteMiddleware,updateUserData)
module.exports = router;