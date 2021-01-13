const express = require('express')
const { getOverview, getTour } = require('../Controllers/viewsController')
const router = express.Router()
//ROUTES FOR PUG RENDERING

  router.get('/', getOverview)
  router.get('/tour', getTour)
module.exports = router;