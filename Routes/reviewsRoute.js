const express = require('express')
const router = express.Router()
const { getAllReviews,createReview } = require('../Controllers/reviewController')
const {protectRouteMiddleware, restrictUser} = require('../Controllers/authenticationController')

router.route('/').get(getAllReviews)
router.route('/').post( protectRouteMiddleware, restrictUser('user'))

module.exports = router