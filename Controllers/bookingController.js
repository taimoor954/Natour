const mongoose = require('mongoose');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Tour } = require('../Models/tourModel');
const { AppError } = require('../utils/Error');
const catchAsync = require('../utils/catchAsync');
const {
  deleteFactory,
  updateFactory,
  createFactory,
  getOneFactoryById,
  getAllFactory,
} = require('./handlerFactory');

exports.getCheckOutSession = catchAsync(async (request, response, next) => {
  //GET THE CURRENT BOOK TOUR
  const tour = await Tour.findById(request.params.tourId);
  //CREATE CHECKOUT SESSION FOR THAT WE NEED NPM STRIPE PACKAGE
//  PRODUCT AND SESSION INFO ARE REQUIRED TO MAKE STRIPE WORK

 const session = await stripe.checkout.sessions.create({
      //SESSION INFO
    payment_method_types: ['card'],
    success_url: `${request.protocol}://${request.get('host')}/`,
    cancel_url: `${request.protocol}://${request.get('host')}/tour/${
      request.params.tourId
    }`,
    customer_email: request.user.email, //from protected route,
    client_reference_id: request.params.tourId,
    //PRODUCT INFO
    line_items: [
      {
        name: `${tour.name} Tour`,
        description: `${tour.summary}`,
        images: [`https://www.natours.dev/img/tours/${tour.imageCover}`], //ONLY THOSE IUMAGES JO JAY WEB PER HOSTED HEN SO NATOUR KI IMAGE LELI
        amount : tour.price * 100 ,//CONVERTING INTO CENTS
        currency : 'usd',
        quantity : 1
    },
    ],
  });
  //CREATE SESSIOM AS RESPONSE
  response.status(200).json({
      status : 'success',
      session
  })

});
