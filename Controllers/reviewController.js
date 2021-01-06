const { Review } = require('../Models/reviewModel');
// const { User } = require('../Models/userModel');
const catchAsync = require('../utils/catchAsync');
const { deleteFactory, updateFactory, createFactory, getOneFactoryById, getAllFactory } = require('./handlerFactory');
// exports.getAllReviews = catchAsync(async (request, response, nexr) => {
//   // var filterObject = {} //if any id is memtioned for specifc tour  review than get that id in a filter object
//   // //then pass it to find else pass filter obj empty to get all tours 
//   // if(request.params.tourId)
//   // {
//   //   filterObject= {
//   //     tour  : request.params.tourId
//   //   }
//   // }
  
//   const reviews = await Review.find(filterObject).select('-__v -id');
//   response.status(200).json({
//     status: 'Success',
//     results: reviews.length,
//     data: {
//       reviews: reviews,
//     },
//   });
// });


exports.checkUserIDAndTourID = (request, response, next) => {
  if (!request.body.tour) {
    request.body.tour = request.params.tourId;
  }
  if (!request.body.user) {
    request.body.user = request.user.id;
  }
  next()
}

// exports.createReview = catchAsync(async (request, response, nexr) => {
  //   // if (!request.body.tour) {
    //   //   request.body.tour = request.params.tourId;
    //   // }
    //   // if (!request.body.user) {
      //   //   request.body.user = request.user.id;
      //   // } //SET IN A MIDDLE WARE
      //   const review = await Review.create(request.body); //ANOTHER WAY OF CREATING DOC
//   return response.status(201).json({
  //     status: 'sucess',
//     data: {
  //       tour: review,
  //     },
  //   });
  // }); //ALL NOW SENT TO MIDDLEWARE
  exports.getAllReviews = getAllFactory(Review)
  exports.getReviewById = getOneFactoryById(Review)
  exports.createReview = createFactory(Review)
exports.deleteReview = deleteFactory(Review)
exports.updateReview = updateFactory(Review)
