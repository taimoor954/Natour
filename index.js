const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const userRouter = require('./Routes/userRoute');
const tourRouter = require('./Routes/tourRoutes');
const {
  AppError
} = require('./utils/Error')
const globalErrorHandeler = require('./Controllers/errorController')
const app = express();
dotenv.config({
  path: `${__dirname}/config.env`
});
console.log(process.env.NODE_ENV)
if (process.env.NODE_ENV == 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());
app.use(express.static(`${__dirname}/public`)); //for static file parameter take address of that static file
//TODO: 
// app.use((request, response, next) => {
//   //CREATING CUSTOM MIDDLEWARE
//   console.log(request.protocol);
//   console.log('HELLO FROM THE 1ST MIDDLEWARE');
//   next();
// })

app.use((request, response, next) => {
  //CREATING CUSTOM MIDDLEWARE
  request.requestTime = new Date().toISOString();
  console.log(request.requestTime);
  // console.log(request.headers)
  next();
});

app.use((request, response, next) => {
  //CREATING CUSTOM MIDDLEWARE
  console.log('HELLO FROM THE 1st MIDDLEWARE');
  // console.log(object)

  next();
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

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