const express = require('express');
const {
    protectRouteMiddleware
} = require('../Controllers/authenticationController');
const {
    getCheckOutSession
} = require('../Controllers/bookingController')
const router = express.Router()

router.get('/checkout-session/:tourId', protectRouteMiddleware, getCheckOutSession)

module.exports = router;