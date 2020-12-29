const catchAsync = require('../utils/catchAsync');
const {
  User
} = require('../Models/userModel');
exports.getAllUsers = catchAsync( async (request, response) => {
    const users = await User.find()
  
  response.status(500).json({
    status: 'error',
    length : users.length,
    data: {
    users,
    },
  });


})
exports.createUser = (request, response) => {
  response.status(500).json({
    status: 'error',
    data: {
      data: 'Route not defined yet',
    },
  });
}
exports.updateUser = (request, response) => {
  response.status(500).json({
    status: 'error',
    data: {
      data: 'Route not defined yet',
    },
  });
}
exports.deleteUser = (request, response) => {
  response.status(500).json({
    status: 'error',
    data: {
      data: 'Route not defined yet',
    },
  });
}
exports.getUserById = (request, response) => {
  response.status(500).json({
    status: 'error',
    data: {
      data: 'Route not defined yet',
    },
  });
}
