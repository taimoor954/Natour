const mongoose = require('mongoose');
const {Tour} = require('../Models/tourModel');
const reviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      required: [true, 'Review can not be empty'],
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tours',
      required: [true, 'review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId, 
      ref: 'User',
      required: [true, 'review must belong to a user'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
  },
  {
    toObject: {
      virtuals: true,
    },
  }
);

reviewSchema.pre(/^find/, function (next) {
  //CHAIN OF POPULATE FOR TOUR AND USER 
  // this.populate({
  //   path: 'tour user', //path tells which field to include
  //   select:
  //     '-locations -description -duration -maxGroupSize -price  -imageCover -passwordResetToken -email -summary -difficulty -ratingsQuantity -ratingsAverage -guides -__v -passwordChangedAt -startLocation -images -startDates',
  // });
  // next();
  //ABOVE ONE TO SHOW EvRYTHING
  this.populate({
    path: 'user', //path tells which field to include
  });
  next();
});

//STATIC METHOD FOR CALCULATION calculate AverageRating For Specific Tour
reviewSchema.statics.calculateAverageRatingForSpecTour = async function(tourId){
  const stats = await this.aggregate([ //this points at REVIEW MODEL and thats why we used STatic method to point
    //at Review Model
    {$match : {tour : tourId}},
    {$group : {
      _id : '$tour',
      nRating : {$sum : 1},
      avgRating : {$avg : '$rating'}
    }}
  ])
  console.log(stats)
 await Tour.findByIdAndUpdate(tourId, {ratingQuantity : stats[0].nRating, ratingAverage : stats[0].avgRating})
}

reviewSchema.post('save', function(){  
 
  // this.constructor().calculateAverageRatingForSpecTour(this.tour) // OR BELOW ONE

  Review.calculateAverageRatingForSpecTour(this.tour)
})

const Review = mongoose.model('reviews', reviewSchema);

exports.Review = Review;
