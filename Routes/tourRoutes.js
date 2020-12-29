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
} = require('../Controllers/authenticationController');

const router = express.Router();

// router.param('id', checkId) //this is basically param middleware
router.route('/top-5-cheapest').get(aliasTopTours, getAllTours);
router.route('/tour-stats').get(getTourStats);
router.route('/monthly-plan/:year').get(monthlyPlan);
router.route('/').get(protectRouteMiddleware, getAllTours).post(createTour); //chaining multiple middleware
router.route('/:id').patch(updateTour).delete(deleteTour).get(getTourById);
module.exports = router;