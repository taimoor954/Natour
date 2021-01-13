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

exports.getTour = catchAsync(async (request, response) => {
  response.status(200).render('tour', {
    title: 'The Forest Hiker Tour'
  })
})