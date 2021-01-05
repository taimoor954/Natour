const mongoose = require('mongoose');

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

const Review = mongoose.model('reviews', reviewSchema);

exports.Review = Review;
