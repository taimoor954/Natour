const express = require('express');
const {
    protectRouteMiddleware,
    restrictUser,
} = require('../Controllers/authenticationController');
const {
    getCheckOutSession,
    getAllBookings,
    createBooking,
    getOneBookingById, deleteBooking, updateBooking
} = require('../Controllers/bookingController');
const router = express.Router();
router.use(protectRouteMiddleware);
router.get('/checkout-session/:tourId', getCheckOutSession);
router.use(restrictUser('admin', 'lead-guide'));
router.route('/').get(getAllBookings).post(createBooking);

router.route("/:id").get(getOneBookingById).patch(updateBooking).delete(deleteBooking)

module.exports = router;