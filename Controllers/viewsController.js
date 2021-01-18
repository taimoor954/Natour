const {
  Tour
} = require('../Models/tourModel')
const catchAsync = require('../utils/catchAsync')
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
  const tour = await Tour.findOne({_id : request.params.tourId}).populate({
    path: 'review',
  })
  response.status(200).render('tour', {
    title: tour.name,
    tour
  })
})

exports.loginUI = (request, response)=> {
response.status(200).render('login', {
  title : 'Log into your account'
})
}