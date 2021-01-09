const { Tour } = require('../Models/tourModel');
const { APIFeatures } = require('../utils/apiFeatures');
const { AppError } = require('../utils/Error');
const mongoose = require('mongoose');
const { request, response } = require('express');
const catchAsync = require('../utils/catchAsync');
const {
  deleteFactory,
  updateFactory,
  createFactory,
  getOneFactoryById,
  getAllFactory,
} = require('./handlerFactory');
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

// exports.checkId = (request, response, next, val) => {
//   console.log(val);
//   if (request.params.id * 1 > tours.length || request.params.id * 1 < 0) {
//     return response.status(404).json({
//       status: 'ID HEHEH not found',
//       data: {
//         data: 'Empty',
//       },
//     });
//   }
//   next();
// } //MIDDLEWARE

// exports.checkTourBody = (request, response, next) => {
//   if (!request.body.name || !request.body.price) {
//     return response.status(404).json({
//       status: '',
//       message: 'Error in body',
//     });
//   }

//   next();
// }

//ALIAS CONCEPT
exports.aliasTopTours = (request, response, next) => {
  request.query.limit = '5';
  request.query.sort = 'price,-ratingAverage';
  request.query.fields = 'price,name, ratingAverage, summary, difficulty';
  next();
};

exports.getAllTours = getAllFactory(Tour);
exports.getTourById = getOneFactoryById(Tour, { path: 'review' });
exports.createTour = createFactory(Tour);
exports.updateTour = updateFactory(Tour);
exports.deleteTour = deleteFactory(Tour);

exports.getTourStats = catchAsync(async (request, response, next) => {
  //AGGREGATION
  const stats = await Tour.aggregate([
    {
      $match: {
        ratingAverage: {
          $gte: 4.5,
        },
      },
    },
    {
      $group: {
        _id: {
          $toUpper: '$difficulty',
        },
        totalRatings: {
          $sum: 'ratingQuantity',
        },
        totalTours: {
          $sum: 1,
        }, //1 will be added when each doc is processed in this stage
        //so we can get total docs
        avgRating: {
          $avg: '$ratingAverage',
        },
        avgPrice: {
          $avg: '$price',
        },
        minPrice: {
          $min: '$price',
        },
        maxPrice: {
          $max: '$price',
        },
      },
    },
    {
      $sort: {
        avgPrice: 1,
      },
    },
    // {
    //   $match : {_id : {$ne : 'EASY'}}
    // }
    //WE CAN USE STAGES AGAIN EVEN IF IT IS USED BEFORE
  ]); //array of stages is passed as an argument

  return response.status(200).json({
    status: 'Success ',
    data: {
      stats,
    },
  });
});

//AGGREGATION PIPLEINING
exports.monthlyPlan = catchAsync(async (request, response, next) => {
  //AGGREGATION PIPELINING
  const year = request.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    // unwind deconstruct karayga startDates array ko and output dega one document
    // for that array field
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: {
          $month: '$startDates',
        },
        numOfTours: {
          $sum: 1,
        },
        tours: {
          $push: '$name', //push in tour array
        },
      },
    },
    {
      $addFields: {
        month: '$_id',
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: {
        numOfTours: -1,
      },
    },
    {
      $limit: 6,
    },
  ]);

  return response.status(200).json({
    status: 'Success ',
    data: {
      plan,
    },
  });
});
// console.log(x)

// exports.getTourById = catchAsync(async (request, response, next) => { //DONE ABOVE
//   console.log(request.params.id);
//   const tour = await Tour.findById(request.params.id).populate('review') //query.populate has been performed iin quiery middleware in tour Model

//   //this fill tha data of guide  sec 11 vid 7
//   // Tour.findOne({_id : request.params.id})//ALTERNATIVE WAY OF FINDING DOCUMENT
//   if (!tour) {
//     return next(new AppError('No tour with this ID found', 404));
//   }
//json in response automatically change contenttype to application/json; charset=utf-8
//   return response.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
//   // '/api/v1/tours/:id/:x/:y? //question mark makes y param as an optonal { id: '8', x: '4', y: undefined }
//   // '/api/v1/tours/:id/:x/:y //use for multiple params { id: '8', x: '4', y: undefined }
// });

//A ROUTE TO GET ALL TOURS WITHIN CERTAIN RADIUS BY PROVIDING DISTANCE, LATLNG & UNIT
// router.route('/tour-within/:distance/center/:latlng/unit/:unit')
// 24.965619, 67.071935 lat,lng format
exports.tourWithin = catchAsync(async (request, response, next) => {
  var { distance, latlng, unit } = request.params;
  var [lat, lng] = latlng.split(',');
  const radius = unit == 'miles' ? distance / 3963.2 : distance / 6378.1;
  if (!lat || !lng) {
    next(new AppError('No longitude or latitude provide', 400));
  }
  // console.log(distance)
  // console.log(lat)
  // console.log(lng)
  // console.log(unit)  x

  const tour = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  }); //lbg first always and array within array is must
  response.status(200).json({
    status: 'success',
    results: tour.length,
    data: {
      tour,
    },
  });
});
 
//TO GET DISTANCE FROM A CERTAIN POINT WHERE YOURE RIGHT NOW TILL ALL OUR ROUTES
exports.getDistancesFromCertainPoint = catchAsync(
  async (request, response, next) => {
    var { latlng, unit } = request.params;
    var [lat, lng] = latlng.split(',');
    const multiplier = unit == 'miles' ? 0.000621371 : 0.001 //MILES CONVERTER : KILOMETER
    // const radius = unit == 'miles' ? distance / 3963.2 : distance / 6378.1
    if (!lat || !lng) {
      next(new AppError('No longitude or latitude provide', 400));
    }
    
    const distances = await Tour.aggregate([
      {
        $geoNear: {
          //ONLY STAGE TO CALCULATE DISTANCE AND SHOULD BE FIRST ONE AND IT REQUIURES ON OF OUR REQUIRED GEOSPHRER INDEX WHICH IN OUR CASE IS tourSchema.index({startLocation : '2dsphere'})

          near: { //ALL THE DISTANCES WILL BE CALCULATED FROM THIS POINT (WHRE YOU ARE AT THE MOMENT)
            type: 'Point', //THIS OBJCT IS CALLED GEOJSON
            coordinates: [lng * 1, lat * 1],
          },
          distanceField: 'distance', //WILL BE CREATED WHERE ALL THE CALC DISTANCES WILL BE STORED
          distanceMultiplier  : multiplier
        },
        
      },
      {
          $project  : {
            distance  : 1,
            name  : 1
          }
      }
    ]);
    response.status(200).json({
      status: 'success',
      data: {
        distances,
      },
    });
  }
);
