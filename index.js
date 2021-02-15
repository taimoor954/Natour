const path = require('path')
const express = require('express');
const rateLimit = require('express-rate-limit'); //safe side from denial attack  and brtue force attack
const helmet = require('helmet');
const dotenv = require('dotenv');
const morgan = require('morgan');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const cors = require('cors')
const userRouter = require('./Routes/userRoute');
const tourRouter = require('./Routes/tourRoutes');
const reviewRouter = require('./Routes/reviewsRoute');
const viewRouter = require('./Routes/viewRoutes');
const cookie_parser = require('cookie-parser')
const {
  AppError
} = require('./utils/Error');
const globalErrorHandeler = require('./Controllers/errorController');
const {
  request,
  response
} = require('express');


// console.log(xss())
const app = express();
app.use(helmet({
  contentSecurityPolicy: false
})); //SECURITY GLOBAL MIDDLEWARE THAT SET SECUTIRTY HTTP
var corsOptions = {
  origin: 'http://localhost:8000',
  credentials: true,
};
app.use(cookie_parser())
app.use(cors(corsOptions)); //FOR ENABLING CORS POLIY

app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8000');
  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'Origin,X-Requested-With,content-type,set-cookie');
  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

app.set('view engine', 'pug') //thats how we set template engine in express
app.set('views', path.join(__dirname, 'View'))


//GLOBAL MIDDLEWARES

app.use(express.static(`${__dirname}/public`)); //for static file parameter take address of that static file

dotenv.config({
  path: `${__dirname}/config.env`,
});
console.log(process.env.NODE_ENV);

if (process.env.NODE_ENV == 'development') {
  app.use(morgan('dev'));
}
const limiter = rateLimit({
  max: 100, //max 100 req can be send from a single api
  windowMs: 60 * 60 * 1000, //100 req in 1 hout
  message: 'Too many request from this IP. Try again in an hour', //if limit cross then show this message
});
app.use('/api', limiter); //global middleware for all apis starting from '/api'
app.use(
  express.json({
    limit: '10kb', //size of req.body can be upto 10kb
  })
); //BODY PARSER
app.use(express.urlencoded({
  extended: true,
  limit: '10kb'
}))

// app.use(cookie_parser())
//data sanitization against noSql query injection and cross site scripting attack also called XXS
// {"email" : {"$gt" : "" }} consider this query. mongoSanitize will remove query operators like $
app.use(mongoSanitize());
// cross site scripting attack also called XSS
app.use(xss()); //    "name" : "<div id='bad-code'>Hello</div>" is insert as a request body it will sanitize that

//for protection from paramter pollution
// {{URL}}api/v1/tours?sort=duration&sort=price only last one will considered
app.use(
  hpp({
    whitelist: [ //these fields are allowed for duplication //{{URL}}api/v1/tours?duration=5&duration=9 like this
      'duration',
      'ratingsQuantity',
      'Average',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

//TEST MIDDLEWARE
app.use((request, response, next) => {
  //CREATING CUSTOM MIDDLEWARE
  request.requestTime = new Date().toISOString();
  console.log(request.requestTime);
  // console.log(`${JSON.stringify(request.cookies)} YOUR COOKIE`)

  next();
});



// app.use((request, response, next) => {
//   //CREATING CUSTOM MIDDLEWARE
//   // console.log('HELLO FROM THE 1st MIDDLEWARE');
//   // console.log(response.header())

//   next();
// });

//ROUTES FOR ROUTE HANDLER  
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

//OPREATIONAL ERROR
//.all means for get post patch delete everything and
//we made this middleware in the end because
//middleware execute sequentially
// * represent all invalid routes
app.all('*', (request, response, next) => {
  // response.status(404).json({
  //   status : 'failed',
  //   message : `route ${request.originalUrl} not found`
  // })

  // const err = new Error(`route ${request.originalUrl} not found`);
  // err.status = 'failed';
  // err.statusCode = 404;
  // next(err);

  //0R

  next(new AppError(`route ${request.originalUrl} not found`, 404));

  //whenever we pass anything in next express  will asume that error has been passed
  //sp evey middleware will be ignored and direclty global error middleware will be reached
});
//middle ware for op error handeling
app.use(globalErrorHandeler);
module.exports = app;