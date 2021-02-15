const {
  Tour
} = require('../Models/tourModel')
const { User } = require('../Models/userModel')
const catchAsync = require('../utils/catchAsync')
const {
  AppError
} = require('../utils/Error')
exports.getOverview = catchAsync(async (request, response) => {
  //GET TOUR DATA FROM COLLECTION
  const tours = await Tour.find()
  //BUILD TEMPLATE

  //RENDER TEMPLATE USING STEP 1

  response.status(200).render('overview', {
    title: 'All Tours',
    tours
  })
})

// exports.getTour = catchAsync(async (request, response) => {
//   response.status(200).render('tour', {
//     title: 'The Forest Hiker Tour'
//   })
// })
exports.getTourById = catchAsync(async (request, response, next) => {
  const tour = await Tour.findOne({
    _id: request.params.tourId
  }).populate({
    path: 'review',
  })
  if (!tour) {
    return next(new AppError('No tour found with this id', 404))
  }
  response.status(200).render('tour', {
    title: tour.name,
    tour
  })
})

exports.loginUI = (request, response) => {
  response.status(200).render('login', {
    title: 'Log into your account'
  })
}

exports.getAccount = (request, response) => {
  response.status(200).render('accounts', {
    title : "Your account"
  })
}

//THIS IS INSIDE /me ROUTE when you click on ypur name 
exports.updateUserData = catchAsync(async (request, response, next) => {
  // console.log(request.body)
  const updatedUser = await User.findByIdAndUpdate(request.user.id, {
    name : request.body.name, 
    email : request.body.email,
  },{
    new : true, //WILL RETURN NEW AND UPDATED DOCUMENT
    runValidators  :true //VALIDATIORS IN MODEL WILL BE USE HERE 
  })
  //name and email are the field of the name we set in accounts.pug form name='name'
  //DO NOT UPDATE PASSWORD WITH FINDBYID AND UPDATE THEREFORE THEY ARE HANDELLED SEPERATELT BELOW
  response.status(200).render('accounts', {
    title : "Your account",
    user : updatedUser
  })
})