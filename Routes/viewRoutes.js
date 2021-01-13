const express = require('express')
const { getOverview, getTour, getTourById } = require('../Controllers/viewsController')
const router = express.Router()
//ROUTES FOR PUG RENDERING

  router.get('/', getOverview)
  // router.get('/tour', getTour)
  router.get('/tours/:tourId', getTourById)
module.exports = router;