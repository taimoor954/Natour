exports.getOverview=(request, response) => {
    response.status(200).render('overview', {
      title: 'All Tours'
    })
  }

 exports.getTour = (request, response) => {
    response.status(200).render('tour', {
      title: 'The Forest Hiker Tour'
    })
  }