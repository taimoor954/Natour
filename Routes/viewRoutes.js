const express = require('express')
const {
  getOverview,
  getTour,
  getTourById,
  loginUI
} = require('../Controllers/viewsController')
const router = express.Router()
//ROUTES FOR PUG RENDERING

router.get('/', getOverview)
// router.get('/tour', getTour)
router.get('/tours/:tourId', getTourById)

router.get('/login', loginUI)
module.exports = router;