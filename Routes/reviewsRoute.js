const express = require('express');
const router = express.Router({ mergeParams: true }); //to get access to tourID param from tour route we use merge param  parameter
const {
  getAllReviews,
  createReview,
} = require('../Controllers/reviewController');
const {
  protectRouteMiddleware,
  restrictUser,
} = require('../Controllers/authenticationController');

router
  .route('/')
  .get(getAllReviews)
  .post(protectRouteMiddleware, restrictUser('user'), createReview);

module.exports = router;
