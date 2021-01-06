const catchAsync = require('../utils/catchAsync');
const { User } = require('../Models/userModel');
const { AppError } = require('../utils/Error');
const {
  deleteFactory,
  updateFactory,
  getOneFactoryById,
  getAllFactory,
} = require('./handlerFactory');

const filterRequestBody = (obj, ...allowedFields) => {
  var filteredObject = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) filteredObject[el] = obj[el];
  });
  return filteredObject;
};

exports.getAllUsers = getAllFactory(User);

//update user data is always handelling seperately from update password in normal web apps
//user if (logged in) can update his/her data
exports.updateMe = catchAsync(async (request, response, next) => {
  // 1) CREATE ERROR IF USER TRIES TO UPDATE PASSWORD
  if (request.body.password || request.body.passwordConfim) {
    return next(
      new AppError(
        'Cant update password or password confirm. Please use /updatepassword',
        400
      )
    );
  }
  //2) uUPDATE USER DOC
  // FILTERING OBJECT BECAUSE INCASE IF USER TRY TO UPDATE PASSWORDCHANGEDAT FIELDS OR ROLE
  //THEN IT SHOULD FILTER SUCH FILEDS AND ALLOW ONLY NAME AND EMAIL (IN OUR CASE)
  //FOR THIS PURPOSE WE CREATED A FUNC CALLED FILTERREQUESTBODY
  //WHICH WILL ONLY ALLOW NAME AND EMAIL
  const filteredObj = filterRequestBody(request.body, 'name', 'email');
  const updatedUser = await User.findByIdAndUpdate(
    request.user.id,
    filteredObj,
    { new: true, runValidators: true }
  );
  response.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.getUserId = (request, response , next) => {

  request.params.id = request.user.id //getOneFactoryById may id jayegi as a param humnay protected middleware kay thru joid aie thi wo ismay set kara di
  next()
}

exports.getMe = getOneFactoryById(User)
//IF USER WANT TO DELETE HIS ACCOUT (DELETION MEANS DEACTIVATION)
exports.deleteme = catchAsync(async (request, response, next) => {
  await User.findByIdAndUpdate(request.user.id, { active: false });
  response.status(204).json({
    //204 for deleted
    status: 'success',
    data: {
      user: null,
    },
  });
});

exports.createUser = (request, response) => {
  response.status(500).json({
    status: 'error',
    data: {
      data: 'Route not defined yet , Please use signup route instad',
    },
  });
};
exports.getUserById = getOneFactoryById(User);
exports.updateUser = updateFactory(User);
exports.deleteUser = deleteFactory(User);
