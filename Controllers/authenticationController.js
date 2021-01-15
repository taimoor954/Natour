//login password changing authention logout will happen here
const {
  promisify
} = require('util');
const crypto = require('crypto');
const {
  request,
  response
} = require('express');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const {
  AppError
} = require('../utils/Error');
const {
  User
} = require('../Models/userModel');
const catchAsync = require('../utils/catchAsync');
const {
  decode
} = require('punycode');
const {
  sendEmail
} = require('../utils/email');
const {
  nextTick
} = require('process');

const createSendToken = (user, statusCode, response) => { //for login and sending token 
  const token = tokenGenerator(user._id);
  response.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (request, response, next) => {
  // const newUser = await User.create(request.body);
  //change due to security flaw because anyone can  register as admin here although he's not
  //so we changed below so we allow them fields that we want noting else
  // ager kiisi ko admin banan hai then go to his doc in mongo and add admin field manualy
  const newUser = await User.create({
    name: request.body.name,
    email: request.body.email,
    passwordChangedAt: request.body.passwordChangedAt,
    role: request.body.role,
    password: request.body.password,
    passwordConfirm: request.body.passwordConfirm,
    
  });
  //payload, secretString, optinal callback m optional call back tells when jwt should expire
  createSendToken(newUser, 201, response);
});

function tokenGenerator(id) {
  return jwt.sign({
      id: id,
    },
    process.env.TOKEN_SECRET_STRING, {
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

  const {
    email,
    password
  } = request.body;
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
  createSendToken(user, 200, response);
});

exports.protectRouteMiddleware = catchAsync(async (request, response, next) => {
  //1Get Token and check if its there
  //2validate token super imp step
  //3Check if user still exist
  //4check if the user changed password after the jwt was issued3

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
  if (await freshUser.changePasswordAfter(decodedToken.iat)) {
    return next(
      new AppError(
        'User recently changed the password, please login again',
        401
      )
    );
  }

  // NEXT MEANS GRANT ACCESS TO PROECTED ROUTE
  request.user = freshUser;
  next();
});

//tour cant be deleted by every user only admin can perform this type of operation
//such operatoins are called AUTHORIZATION

//if you want to pass an arg in middleware func which just pass response, request, next as a function then
//create a wrapper function and spread all the args in it and then return the middleware func from it
exports.restrictUser = (...roles) => {
  //roles ['admin', 'lead-guide']
  //the way to check restriction is if you find anytbing else like user it wont be found in roles array so an error will be thrown
  return (request, response, next) => {
    //request.user=freshUser kay thru reqUser may sara data mil jayga like name email role wagrea
    //jis waja say hum role check karsaktay hen
    ///isay middleware say pehlay protect route middleware chalay ga
    //tabhi request.user milay ga
    if (!roles.includes(request.user.role)) {
      return next(
        new AppError('You do not have permisson to perform this action', 403)
      );
    }
    next();
  };
};

//forgot password is completed in 2 steps
//first step takes email as a post method when click on forgot password  (forgotpassword route)
//this sends reset token (not json) token to the email provided

//second step sends token from his email along with the new password to update password
exports.forgotPassword = catchAsync(async (request, response, next) => {
  //FIRST FIND USER ON BASIS OF EMAIL'
  const user = await User.findOne({
    email: request.body.email,
  });
  if (!user) {
    return next(new AppError('User with that email not found', 404));
  }
  //SECOND GENERATE RANDOM TOKEN TO RESENT PASSWORD
  const resetToken = user.createPasswordResetToken();
  await user.save({
    validateBeforeSave: false,
  });

  //THIRD SEND IT TO USER EMAIL
  const resetUrl = `${request.protocol}://${request.get(
    'host'
  )}/api/v1/users/reset-password/${resetToken}`;
  const message = `Forgot your password? Submit a patch request with your new password
  and password confirm to : ${resetUrl}.\n if you know the pass then ignore the email`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 mins)',
      message,
    });
    return response.status(200).json({
      status: 200,
      message: 'token send to mail',
    });
  } catch (error) {
    // console.log(error)
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiresAt = undefined;
    await user.save({
      validateBeforeSave: false,
    });
    return next(new AppError('error in sendimg mail'), 500);
  }
});

exports.resetPassword = catchAsync(async (request, response, next) => {
  //GET USER ON BASIS OF TOKEN
  console.log(request.params.randomToken);
  const hashedToken = crypto
    .createHash('sha256')
    .update(request.params.randomToken)
    .digest('hex');
  // IF TOKEN NOT EXPIRED //  THERE IS A USER , SET NEW PASSWORD
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpiresAt: {
      $gt: Date.now(),
    },
  });
  // console.log(user)

  if (!user) {
    return next(
      new AppError(
        'Token has been expired for reseting passwrd or user not found',
        400
      )
    );
  }

  user.password = request.body.password;
  user.passwordConfirm = request.body.passwordConfirm;
  user.passwordResetTokenExpiresAt = undefined;
  user.passwordResetToken = undefined;
  await user.save();
  const token = tokenGenerator(user._id);
  //UPDATE passwordChangedat FOR THE USER  //for this we created a doc middleware in userModel

  //LOG THE USER IN AND SEND JWT
  createSendToken(user, 200, response);
});

exports.updatePassword = catchAsync(async (request, response, next) => {
  //before updating password we wil ask for current pass as a security measure

  //FIRST FETCH USER FROM COLLECTION
  const user = await User.findById(request.user._id).select('+password');
  //CHECK IF CURRENT POSTED PASSWORD IS CORRECT
  if (
    !(await user.correctPassword(user.password, request.body.passwordCurrent))
  )
    return next(new AppError('Current password is wrong', 401));

  //IF CORRECT THEN UPDATE THE PASSWORD
  user.password = request.body.password;
  user.passwordConfirm = request.body.passwordConfirm;
  await user.save();

  //LOG USER AND SEND JWT
  createSendToken(user, 200, response);
});