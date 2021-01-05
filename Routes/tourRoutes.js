// const { response } = require('express');
const express = require('express');
const {
  getAllTours,
  createTour,
  updateTour,
  deleteTour,
  getTourById,
  aliasTopTours,
  getTourStats,
  monthlyPlan,

} = require('../Controllers/tourController');
const {
  protectRouteMiddleware,
  restrictUser
} = require('../Controllers/authenticationController');
// const { createReview } = require('../Controllers/reviewController');
const reviewRouter = require('../Routes/reviewsRoute');

const router = express.Router();


// router.param('id', checkId) //this is basically param middleware
router.route('/top-5-cheapest').get(aliasTopTours, getAllTours);
router.route('/tour-stats').get(getTourStats);
router.route('/monthly-plan/:year').get(monthlyPlan);
router.route('/').get(protectRouteMiddleware, getAllTours).post(createTour); //chaining multiple middleware
router.route('/:id').patch(updateTour).delete(protectRouteMiddleware, restrictUser('admin', 'lead-guide'), deleteTour).get(getTourById);

//NESTED ROUTE 
//api/v1/tour/4564654/reviews
//api/v1/tour/4564654/reviews/54654 THIS ONE AND ABOVE ONE IS BASICALLY A NESTED ROUTE 
// router.route('/:tourId/reviews').post(protectRouteMiddleware, restrictUser('user'), createReview);
//CREATE REVIEW HORAHA HAI BUT HO TOUR KAY ROUTE MAY ROUTE RAHA HAI WHICH IS WRONG
//SO HUMNAY /:tourId/reviews KO REVIEWROUTE MAY BHEJ DIA TAKAY WO HANDLE KARAY
//OR TOURID HUMNAY REVIEW KAY EXPRESS.ROUTER KAY PARAM MERGE KAY THRU GET KARLI

router.use('/:tourId/reviews', reviewRouter) //for this case we want to use review router


module.exports = router;