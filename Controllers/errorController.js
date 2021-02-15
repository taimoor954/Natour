const dotenv = require('dotenv').config();
const { AppError } = require('../utils/Error');
const mongoose = require('mongoose');
var routeNotFound = (err) => {
  var message = err.message;
  return new AppError(message, 404);
};
var castObjectID = (err) => {
  var message = `${err.value} is an invalid ${err.path}`;
  return new AppError(message, 400);
};
var validationErrors = (err) => {
  var message = `${err.message}`;
  return new AppError(message, 400);
};
var handleJWTError = (err) => {
  return new AppError('Invalid Token. Please login again', 401);
};
var handleJWTExpityError = (err) => {
  return new AppError(' Token Expired. Please login again', 401);
};

var sendErrorDev = (err, request, response) => {
  //ERROR HANDELLING FOR JUST API
  if (request.originalUrl.startsWith('/api')) {
    return response.status(err.statusCode).json({
      status: err.status,
      error: err,
      statusCode: err.statusCode,
      message: err.message,
      stack: err.stack,
    });
  } else {
    //ERROR HANDELLING FOR RENDERED WEBSITE
   return response.status(err.statusCode).render('error', {
      title: 'Something went very wrong',
      msg: err.message,
    });
  }
};
var sendErrorProd = (err, request, response) => {
  //ERROR HANDELLING FOR API
  if (request.originalUrl.startsWith('/api')) {
      //OPERATIONAL ERROR MEANS TRUSRED ERROR OR ERROR THAT WE KNOW OR WE HAVE HANDLED IN SOME WAY
    if (err.isOperationalError) {
      return response.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      // 1) Log error
      console.error('ERROR 🔥🔥', err);

      // 2) Send generic message
      return response.status(500).json({
        status: 'error',
        message: 'Something went very wrong!',
        messageError: err.message,
      });
    }
  } else {
    //ERROR HANDELLING FOR RENDERED WEBSIYE
    if (err.isOperationalError) {
      return response.status(err.statusCode).render('error', {
        title: 'Something went very wrong',
        msg: err.message,
      });
    } else {
      // 1) Log error
      console.error('ERROR 🔥🔥', err);
      // 2) Send generic message
      return response.status(err.statusCode).render('error', {
        title: 'Something went very wrong',
        msg: 'Please try again later',
      });
    }
  }
};

module.exports = (err, request, response, next) => {
if (err.message.includes(`route ${request.originalUrl} not found`)) {
    return response.status(err.statusCode).json({
      statusCode: err.statusCode,
      status: err.status,
      message: err.message,
    });
  }

  // console.log(error.message)
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'ERROR STATUS NOT DEFINED IN APPLICATION';
  var error = {
    ...err,
  };
  // error.message= err.message SHORT TRICK IF ERROR IS NOT INCLUDING MESSAGE WITH IT SELF

  // if (process.env.NODE_ENV == 'development') {
  //   return response.status(500).json({
  //     error: err,
  //     message: err.message,
  //     stack: err.stack,
  //   });
  // }
  // if (process.env.NODE_ENV == 'production') {
  //   return response.status(err.statusCode).json({
  //     message: err.message,
  //     status: err.status,
  //   });
  // } //extra

  if (process.env.NODE_ENV == 'development') {
    // if (err.hasOwnProperty('kind')) {
    //   error = castObjectID(error);
    // }
    // if (err.hasOwnProperty('errors')) {
    //   if (err.errors.hasOwnProperty('name')) {
    //     error = validationErrors(err, response);

    //     console.log('issues in name');
    //   }
    //   if (err.errors.hasOwnProperty('difficulty')) {
    //     error = validationErrors(err, response);
    //     console.log('issues in difficulty');
    //   }
    //   if (err.errors.hasOwnProperty('price')) {
    //     error = validationErrors(err, response);
    //     console.log('issues in price');
    //   }
    //   if (err.errors.hasOwnProperty('maxGroupSize')) {
    //     error = validationErrors(err, response);
    //     console.log('issues in maxGroupSize');
    //   }
    //   console.log('validation errors');
    // }

    return sendErrorDev(err, request, response);
  }

  if (process.env.NODE_ENV == 'production') {
    // if (err.hasOwnProperty('kind')) {
    //   error = castObjectID(error);
    // }
    // if (err.hasOwnProperty('errors')) {
    //   if (err.errors.hasOwnProperty('name')) {
    //     error = validationErrors(err, response);

    //     console.log('issues in name');
    //   }
    //   if (err.errors.hasOwnProperty('difficulty')) {
    //     error = validationErrors(err, response);
    //     console.log('issues in difficulty');
    //   }
    //   if (err.errors.hasOwnProperty('price')) {
    //     error = validationErrors(err, response);
    //     console.log('issues in price');
    //   }
    //   if (err.errors.hasOwnProperty('maxGroupSize')) {
    //     error = validationErrors(err, response);
    //     console.log('issues in maxGroupSize');
    //   }
    //   console.log('validation errors');
    // }
    if (err.name == 'JsonWebTokenError') {
      //  return new AppError('nvalidToken. log in again', 401)
      error = handleJWTError(err);
    }
    if (err.name == 'TokenExpiredError') {
      //  return new AppError('nvalidToken. log in again', 401)
      error = handleJWTExpityError(err);
    }

    return sendErrorProd(err, request, response);
  }
  sendErrorProd(err, response);
};
