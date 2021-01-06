const { APIFeatures } = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const { AppError } = require('../utils/Error');

//FACTORY FUNCTIONS
//FACTORY FUNCTIONS ARE FUNCTIONS THAT RETURN A FUNCTION

exports.deleteFactory = (Model) =>
  catchAsync(async (request, response, next) => {
    const doc = await Model.findByIdAndDelete(request.params.id);
    if (!doc) {
      return next(new AppError('No doc with this ID found', 404));
    }
    return response.status(200).json({
      status: 'Success ',
      message: 'Succesfully deleted',
    });
  });

exports.updateFactory = (Model) =>
  catchAsync(async (request, response, next) => {
    const doc = await Model.findByIdAndUpdate(request.params.id, request.body, {
      new: true,
      runValidators: true, //will run mongoose schema validators again
    });
    if (!doc) {
      return next(new AppError('No doc with this ID found', 404));
    }
    return response.status(200).json({
      status: 'Success ',
      message: 'Succesfully updated ',
      data: {
        doc,
      },
    });
  });

exports.createFactory = (Model) =>
  catchAsync(async (request, response, next) => {
    const doc = await Model.create(request.body); //ANOTHER WAY OF CREATING DOC
    return response.status(201).json({
      status: 'sucess',
      data: {
        tour: doc,
      },
    });
    // The Object.assign() method copies all enumerable own properties from one or more
    //source objects to a target object. It returns the target object.
    //json in response automatically change contenttype to application/json; charset=utf-8
  });

exports.getOneFactoryById = (Model, populateOptions) =>
  catchAsync(async (request, response, next) => {
    let query = Model.findById(request.params.id);
    if (populateOptions) query = query.populate(populateOptions);
    // console.log(request.params.id);
    const doc = await query; //query.populate has been performed iin quiery middleware in tour Model

    //this fill tha data of guide  sec 11 vid 7
    // Tour.findOne({_id : request.params.id})//ALTERNATIVE WAY OF FINDING DOCUMENT
    if (!doc) {
      return next(new AppError('No tour with this ID found', 404));
    }
    return response.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
    // '/api/v1/tours/:id/:x/:y? //question mark makes y param as an optonal { id: '8', x: '4', y: undefined }
    // '/api/v1/tours/:id/:x/:y //use for multiple params { id: '8', x: '4', y: undefined }
  });

exports.getAllFactory = (Model) =>
  catchAsync(async (request, response, next) => {
    //SMALL HACK FOR REVIWS IN TOUR (NESTED TOUR AND REVIEW)
    var filterObject = {}; //if any id is memtioned for specifc tour  review than get that id in a filter object
    //then pass it to find else pass filter obj empty to get all tours
    if (request.params.tourId) {
      filterObject = {
        tour: request.params.tourId,
      };
    }

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
    const features = new APIFeatures(Model.find(filterObject), request.query)
      .filter()
      .sort()
      .filedLimiting()
      .pagination();

    const doc = await features.query;
    return response.status(200).json({
      status: 'Success',
      results: doc.length,
      data: {
        doc: doc,
      },
    });
    //json in response automatically change contenttype to application/json; charset=utf-8
  });
