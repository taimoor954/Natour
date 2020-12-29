//login password changing authention logout will happen here
const { promisify } = require('util');
const { request } = require('express');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { AppError } = require('../utils/Error');
const { User } = require('../Models/userModel');
const catchAsync = require('../utils/catchAsync');
const { decode } = require('punycode');

exports.signup = catchAsync(async (request, response, next) => {
  // const newUser = await User.create(request.body);
  //change due to security flaw because anyone can  register as admin here although he's not
  //so we changed below so we allow them fields that we want noting else
  // ager kiisi ko admin banan hai then go to his doc in mongo and add admin field manualy
  const newUser = await User.create({
    name: request.body.name,
    email: request.body.email,
    password: request.body.password,
    passwordConfirm: request.body.passwordConfirm,
    passwordChangedAt: request.body.passwordChangedAt,
    role: request.body.role,
  });
  //payload, secretString, optinal callback m optional call back tells when jwt should expire
  const token = tokenGenerator(newUser._id);

  response.status(201).json({
    status: 'Success',
    token,
    data: {
      user: newUser,
    },
  });
});
function tokenGenerator(id) {
  return jwt.sign(
    {
      id: id,
    },
    process.env.TOKEN_SECRET_STRING,
    {
      ///token will be expiredin 90 days for securitty reasons
      expiresIn: process.env.TOKEN_EXPIRY_IN,
    }
  );
}

exports.login = catchAsync(async (request, response, next) => {
  //CHECK IF EMAIL PASSWORD EXIST
  //IF NO EMAIL NO PASS THEN SHOW ERROR
  //IF EMAIL PASS CORECT
  //COMPARE WITH PASS SAVED IN DATABASE IF FALSE THROW ERROR AND MOVE TO ERROR MIDDLEWARE
  //IF EVERYTHING OKAY SEND JSON TOKEN TO CLIENT
  // console.log(process.env.TOKEN_EXPIRY_IN)

  const { email, password } = request.body;
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }
  const user = await User.findOne({
    email,
  }).select('+password'); //+ to include field that is not included by default

  // const correct = await user.correctPassword(password, user.password)
  if (!user || !(await user.correctPassword(user.password, password))) {
    return next(new AppError('Incorrect email and pass', 401)); //401 means unauthorize
  }
  const token = tokenGenerator(user._id);
  response.status(200).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
});

exports.protectRouteMiddleware = catchAsync(async (request, response, next) => {
  //1Get Token and check if its there
  //2validate token super imp step
  //3Check if user still exist
  //4check if the user changed password after the jwt was issued3
  // console.log(process.env.TOKEN_EXPIRY_IN)
  //1Get Token and check if its there
  let token;
  //Headers may authorization as a key aiega value may Bearer<space>JWT
  if (
    request.headers.authorization &&
    request.headers.authorization.startsWith('Bearer')
  ) {
    token = request.headers.authorization.split(' ')[1]; //split and get seocnd elemet
  }
  // console.log(token)
  if (!token) {
    // console.log('object')
    return next(new AppError('You are not logged in .Please log in', 401));
  }

  //2validate token super imp step

  //to promisify this func means to make it return promise we use promisify from  util module
  //  const decodedToken = promisify(jwt.verify)(token, process.env.TOKEN_SECRET_STRING)//ASYNC FUNC)
  //OR

  const decodedToken = await jwt.verify(token, process.env.TOKEN_SECRET_STRING); // the above one ant this one both return promise
  // console.log(decodedToken);
  //3Check if user still exist
  const freshUser = await User.findById(decodedToken.id);
  if (!freshUser)
    return next(
      new AppError('The user belonging to this token is no longer exist', 401)
    );

  //4check if the user changed passwor d after the jwt was issued3
      // console.log(freshUser.changePasswordAfter(decodedToken.iat))
  if(await freshUser.changePasswordAfter(decodedToken.iat)) {
    return next(new AppError('User recently changed the password, please login again', 401))
  }

  // NEXT MEANS GRANT ACCESS TO PROECTED ROUTE
  request.user = freshUser
  next();
});


//tour cant be deleted by every user only admin can perform this type of operation
//such operatoins are called AUTHORIZATION

//if you want to pass an arg in middleware func which just pass response, request, next as a function then
//create a wrapper function and spread all the args in it and then return the middleware func from it
exports.restrictUser = (...roles)=> {
  //roles ['admin', 'lead-guide']
  //the way to check restriction is if you find anytbing else like user it wont be found in roles array so an error will be thrown
  return (request, response, next) => {
    //request.user=freshUser kay thru reqUser may sara data mil jayga like name email role wagrea
    //jis waja say hum role check karsaktay hen
    ///isay middleware say pehlay protect route middleware chalay ga 
    //tabhi request.user milay ga
    if(!roles.includes(request.user.role))
    {
      return next(new AppError('You do not have permisson to perform this actin', 403))
    }
    next()
  }
}

