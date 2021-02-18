const express = require('express');
const {
  getOverview,
  getTour,
  getTourById,
  loginUI,
  getAccount,
  updateUserData,
  getMyTours,
} = require('../Controllers/viewsController');
const {
  protectRouteMiddleware,
  isLoggedIn,
} = require('../Controllers/authenticationController');
const {
  createBookingCheckoutInDB,
} = require('../Controllers/bookingController');

const router = express.Router();
//ROUTES FOR PUG RENDERING
// router.use(isLoggedIn) //WILL BE APPLIED FOR ALL THE ROUTES BELOW
router.get('/login', isLoggedIn, loginUI);
router.get('/', createBookingCheckoutInDB ,isLoggedIn, getOverview);
router.get('/tours/:tourId', isLoggedIn, getTourById);
router.get('/me', protectRouteMiddleware, getAccount);
router.get('/my-tours', protectRouteMiddleware, getMyTours);
//IF YOU WANNA USE FORM METHOD TO UPDATE NAME AND EMAIL USE THIS ROUTE
// router.post('/submit-user-data', protectRouteMiddleware,updateUserData)
module.exports = router;
