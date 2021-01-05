const express = require('express')
const route = express.Router()
const { getAllReviews,createReview } = require('../Controllers/reviewController')
const {protectRouteMiddleware, restrictUser} = require('../Controllers/authenticationController')

route.get('/', getAllReviews)
route.post('/', protectRouteMiddleware, restrictUser('user'), createReview)

module.exports = route