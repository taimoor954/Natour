const { Review } = require("../Models/reviewModel");
const catchAsync = require("../utils/catchAsync");

exports.getAllReviews = catchAsync(async(request, response , nexr) => {
const reviews = await Review.find().select('-__v -id')
response.status(200).json({
    status : "Success",
    results  : reviews.length,
    data : {
        reviews : reviews
    }
})

})

exports.createReview = catchAsync(async (request, response , nexr) => {
    const review = await Review.create(request.body); //ANOTHER WAY OF CREATING DOC
    return response.status(201).json({
      status: 'sucess',
      data: {
        tour: review,
      },
    });

})