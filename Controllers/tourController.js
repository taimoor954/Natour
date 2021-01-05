const { Tour } = require('../Models/tourModel');
const { APIFeatures } = require('../utils/apiFeatures');
const { AppError } = require('../utils/Error');
const mongoose = require('mongoose');
const { request, response } = require('express');
const catchAsync = require('../utils/catchAsync');
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

exports.getAllTours = catchAsync(async (request, response, next) => {
  // //SIMPLE QUERING
  // var queryObject = { ...request.query };

  // const excludedFields = ['sort', 'page', 'limit', 'fields'];
  // excludedFields.forEach((e) => delete queryObject[e]);
  // //The JavaScript delete operator removes a property from an object;
  // //if no more references to the same property are held, it is eventually released automatically
  // // console.log(queryObject);
  // // const query =  Tour.find(queryObject); //1ST WAY OF QUERING DOCUMENT //returns query

  // // const tours = await Tour.find()
  // // .where('difficulty').
  // // equals('easy')///ANOTHER WAY OF QUERING DOCUMENT

  // //1 ADVANCE QUERY
  // var queryStr = JSON.stringify(queryObject);
  // queryStr = queryStr.replace(/\b(lte|lt|gte|gt)\b/g, (match) => `$${match}`);
  // console.log(JSON.parse(queryStr), 'after replace'); //AFTER REPLACE
  // let query = Tour.find(JSON.parse(queryStr)); //1ST WAY OF QUERING DOCUMENT //returns query
  // //{duration : {$gte : '5'}, difficulty : 'easy'} //WAY OF WRIITNG A QUERY
  // // { duration: { gte: '5' }, difficulty: 'easy' }//WHAT WE GOT FROM REQUEST.QUERY

  //2 SORTING
  // if (request.query.sort) {
  //   // http://localhost:8000/api/v1/tours?sort=-price for descending sorting
  //   // http://localhost:8000/api/v1/tours?sort=price,maxGroupSize for more than 1 params
  //   const sortBy = request.query.sort.split(',').join(' ');
  //   console.log(sortBy);
  //   query = query.sort(sortBy);
  // }
  // else{
  //   query = query.sort('-createdAt')
  // }

  //3FIELD LIMITING
  // if(request.query.fields)
  // {
  //   console.log(request.query.fields)
  //   var fields =request.query.fields.split(',').join(' ');
  //   query = query.select(fields)//SELECTING LIMITED FIELDS IS CALLED PROJECTING
  // }
  // else{
  //   query = query.select('-__v ')
  // }

  //4PAGINATION
  //consider we have 1000 docs in a collection so we divide 100 docs in a page
  //therefore 10 pages will be created//THIS IS LIKE CHUNKS SO WE DONT HAVE TO QUERY
  //WHOLDE DATABASSEE
  // query = query.skip(2).limit(10)means user wants 10 results on page 2 //means 10 results per page
  //skip for pagination and limit for limiitng
  //   const page = request.query.page*1 || 1;
  //   const limit =  request.query.limit*1 || 100
  //     const skip = (page - 1)*limit
  //  query = query.skip(skip).limit(limit)
  //   if(request.query.page)
  //   {
  //     const numberOfTours = await Tour.countDocuments()
  //     if(skip>=numberOfTours)
  //     {
  //       throw new Error ('Page does not exist')
  //     }
  //   }
  //

  //EXECUTE QUIERY
  //populate create a new quiry so this might affect the performance 
  //so in big application it might have some affect 
  const features = new APIFeatures(Tour.find(), request.query)
    .filter()
    .sort()
    .filedLimiting()
    .pagination()
    

  const tours = await features.query;
  response.status(200).json({
    status: 'Success',
    results: tours.length,
    data: {
      tours: tours,
    },
  });
  //json in response automatically change contenttype to application/json; charset=utf-8
});

exports.getTourById = catchAsync(async (request, response, next) => {
  console.log(request.params.id);
  const tour = await Tour.findById(request.params.id).populate('review') //query.populate has been performed iin quiery middleware in tour Model
  
  //this fill tha data of guide  sec 11 vid 7
  // Tour.findOne({_id : request.params.id})//ALTERNATIVE WAY OF FINDING DOCUMENT
  if (!tour) {
    return next(new AppError('No tour with this ID found', 404));
  }
  return response.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
  // '/api/v1/tours/:id/:x/:y? //question mark makes y param as an optonal { id: '8', x: '4', y: undefined }
  // '/api/v1/tours/:id/:x/:y //use for multiple params { id: '8', x: '4', y: undefined }
});

// console.log(request.params)

//json in response automatically change contenttype to application/json; charset=utf-8

exports.createTour = catchAsync(async (request, response, next) => {
  const newTour = await Tour.create(request.body); //ANOTHER WAY OF CREATING DOC
  return response.status(201).json({
    status: 'sucess',
    data: {
      tour: newTour,
    },
  });
  // The Object.assign() method copies all enumerable own properties from one or more
  //source objects to a target object. It returns the target object.

  //json in response automatically change contenttype to application/json; charset=utf-8
});

exports.updateTour = catchAsync(async (request, response, next) => {
  const tour = await Tour.findByIdAndUpdate(request.params.id, request.body, {
    new: true,
    runValidators: true, //will run mongoose schema validators again
  });
  if (!tour) {
    return next(new AppError('No tour with this ID found', 404));
  }
  return response.status(200).json({
    status: 'Success ',
    data: {
      tour,
    },
  });
});

exports.deleteTour = catchAsync(async (request, response, next) => {
  const tour = await Tour.findByIdAndDelete(request.params.id);
  if (!tour) {
    return next(new AppError('No tour with this ID found', 404));
  }
  return response.status(200).json({
    status: 'Success ',
    message: 'Succesfully deleted',
  });
});

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
