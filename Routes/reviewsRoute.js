const express = require('express');
const router = express.Router({ mergeParams: true }); //to get access to tourID param from tour route we use merge param  parameter
const {
  getAllReviews,
  createReview,
  deleteReview,
  updateReview,
  checkUserIDAndTourID,
  getReviewById,
} = require('../Controllers/reviewController');
const {
  protectRouteMiddleware,
  restrictUser,
} = require('../Controllers/authenticationController');

router
  .route('/')
  .get(getAllReviews)
  .post(
    protectRouteMiddleware,
    restrictUser('admin', 'user'),
    checkUserIDAndTourID,
    createReview
  );

router
  .route('/:id')
  .delete(protectRouteMiddleware, restrictUser('admin', 'user'), deleteReview) //same route for {{URL}}api/v1/tours/5c88fa8cf4afda39709c2951/reviews
  .patch(protectRouteMiddleware, restrictUser('admin', 'user'), updateReview) ////same route for {{URL}}api/v1/tours/5c88fa8cf4afda39709c2951/reviews
  .get(getReviewById);

module.exports = router;
