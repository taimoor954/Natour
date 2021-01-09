const mongoose = require('mongoose');
const { Tour } = require('../Models/tourModel');
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

reviewSchema.index({tour : 1, user : 1}, {unique : true}) //WE CANT CREATE 2 REVIWS FOR A TOUR BY A SPECFIC USER
//FOR THIS PUROPOSE WE USE COMPOUND KEY. ONLY 1 REVIEW CAN BE CREATED BY A USER FOR 1 TOUR SO FOR THAT WE USE COMPUND INDEX

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
reviewSchema.statics.calculateAverageRatingForSpecTour = async function (
  tourId
) {
  const stats = await this.aggregate([
    //this points at REVIEW MODEL and thats why we used STatic method to point
    //at Review Model
    { $match: { tour: tourId } },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  console.log(stats);
  if(stats.length > 0){
  await Tour.findByIdAndUpdate(tourId, {
    ratingQuantity: stats[0].nRating,
    ratingAverage: stats[0].avgRating,
  
  }); 
}
  else{ //if all reviews are deleted then set ratingQuantity to 0 and ratingAverage to 4.5
    await Tour.findByIdAndUpdate(tourId, {
      ratingQuantity: 0,
      ratingAverage: 4.5,
    
    });
  }
};
//TO USE ABOVE FUNCTION WE CALL IN POST DOC MIDDLEWARE AND STATIC METHOD WILL BE CALLED BY MODEL
//THIS WORKS FOR SAVE OR CREATING A REVIEW
reviewSchema.post('save', function () { 
  // this.constructor().calculateAverageRatingForSpecTour(this.tour) // OR BELOW ONE
  Review.calculateAverageRatingForSpecTour(this.tour);
});

//BUT IF YOU WANT TO UPDATE THE EXISTING REVIEW THAN like fineOneAndUpdate or fineOneAndDelete

reviewSchema.pre(/^findOneAnd/,async function(next){
  // console.log(this) //HERE THIS POINTS AT QUERY WHICH IS FINEONE QUERY
  //WE NEED TO POINT AT MODEL SO THAT WE CAN UPDATE IT, BUT THIS HERE POINTS AT QUERY SO HERE IS A SOLUUTION
  this.r =  await this.findOne() //STORED IT IN THIS.R SO THAT IT CAN ACCESED IN OTHER SCHEMA METHODS AS WELL
  console.log(this.r)           
         
  next()
 

}) 
reviewSchema.post(/^findOneAnd/,async function(){
  console.log(this.r) //POINTS AT THE REVIEW DOC 
  // await this.findOne() //WONT WORK HERE BECAUSE POST MIDDLEWARE MAY QUERY HAS ALREADY BEEN EXECUTED IN PRE MIDDLEWRE
 await this.r.constructor.calculateAverageRatingForSpecTour(this.r.tour)  
 
}) 


const Review = mongoose.model('reviews', reviewSchema);

exports.Review = Review;
