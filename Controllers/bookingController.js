const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const {
  Tour
} = require('../Models/tourModel');
const {
  AppError
} = require('../utils/Error');
const catchAsync = require('../utils/catchAsync');
const {
  deleteFactory,
  updateFactory,
  createFactory,
  getOneFactoryById,
  getAllFactory,
} = require('./handlerFactory');
const mongoose = require('mongoose');
const {
  Booking
} = require('../Models/bookingModel');
exports.getCheckOutSession = catchAsync(async (request, response, next) => {
  //GET THE CURRENT BOOK TOUR
  const tour = await Tour.findById(request.params.tourId);
  //CREATE CHECKOUT SESSION FOR THAT WE NEED NPM STRIPE PACKAGE
  //  PRODUCT AND SESSION INFO ARE REQUIRED TO MAKE STRIPE WORK

  const session = await stripe.checkout.sessions.create({
    //SESSION INFO
    payment_method_types: ['card'],
    success_url: `${request.protocol}://${request.get('host')}/?tour=${request.params.tourId}&user=${request.user.id}&price=${tour.price}`, //not secure at all lekin sirf dev phase tak karsatay, prod may iski jaga stripe web hooks use karenay to create booking in db
    cancel_url: `${request.protocol}://${request.get('host')}/tour/${request.params.tourId}`,
    customer_email: request.user.email, //from protected route,
    client_reference_id: request.params.tourId,
    //PRODUCT INFO
    line_items: [{
      name: `${tour.name} Tour`,
      description: `${tour.summary}`,
      images: [`https://www.natours.dev/img/tours/${tour.imageCover}`], //ONLY THOSE IUMAGES JO JAY WEB PER HOSTED HEN SO NATOUR KI IMAGE LELI
      amount: tour.price * 100, //CONVERTING INTO CENTS
      currency: 'usd',
      quantity: 1,
    }, ],
  });
  //CREATE SESSIOM AS RESPONSE
  response.status(200).json({
    status: 'success',
    session,
  });
});
// TEMPROORAY FOR DEVLOPMENT AS IT IS UNSECURE EVERYONE CAN MAKE BOOKING WITHOUT EVEN PAYING
exports.createBookingCheckoutInDB = catchAsync(async (request, response, next) => {
  const {
    tour,
    user,
    price
  } = request.query;
  if (!tour && !user && !price) {
    return next();
  }
  console.log(tour)
  console.log(price)
  console.log(user)
  await Booking.create({
    tour,
    user,
    price
  })
  response.redirect(request.originalUrl.split('?')[0]) //to create new request to our root url so we will hit ${request.protocol}://${request.get('host')}/tour this route 
});