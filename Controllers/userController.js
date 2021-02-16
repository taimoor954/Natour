const multer = require('multer')
const sharp = require('sharp') //for image processing in node like resizing 
const catchAsync = require('../utils/catchAsync');
const {
  User
} = require('../Models/userModel');
const {
  AppError
} = require('../utils/Error');
const {
  deleteFactory,
  updateFactory,
  getOneFactoryById,
  getAllFactory,
} = require('./handlerFactory');


//FIRST upload an image in file system usinf diskstorage takes an object with 2 values dest and filename
// const multerStorage = multer.diskStorage({ //for storing in disk and changing name 
//   destination: (request, file, cb) => {
//     cb(null, "public/img/users")
//   },
//   filename: (request, file, cb) => {
//     const ext = file.mimetype.split('/')[1]
//     cb(null, `user-${request.user.id}--${Date.now()}.${ext}`)
//   }
// })

//STROE IN MEMORY SO THAT CAN BE RESIZE FROM MEMORY 
const multerStorage = multer.memoryStorage() //this way image wil be saved as buffer 

//SECOND
const multerFilter = (request, file, cb) => { //to check if uploaded file is img of not then pass an error
  if (file.mimetype.startsWith('image')) {
    cb(null, true) //first arg no error null if image is true and and second arg true 
  } else {
    cb(new AppError('Not an image! PLease upload an image ', 400), false)
  }
}

//THIRD
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,

}) //picture uploaded will be stored in directory publib/img/user

//FOURTH
exports.uploadUserPhoto = upload.single('photo')


const filterRequestBody = (obj, ...allowedFields) => {
  var filteredObject = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) filteredObject[el] = obj[el];
  });
  return filteredObject;
};

exports.getAllUsers = getAllFactory(User);

exports.resizeUserImage = catchAsync(async (request, response, next) => {
  if (!request.file) return next() //if no image move to next middleware

  request.file.filename = `user-${request.user.id}--${Date.now()}.jpeg`

  await sharp(request.file.buffer).resize(500, 500).toFormat('jpeg').jpeg({
    quality: 90
  }).toFile(`public/img/users/${request.file.filename}`)

  next()

})

//update user data is always handelling seperately from update password in normal web apps
//user if (logged in) can update his/her data
exports.updateMe = catchAsync(async (request, response, next) => {
  // console.log(request.file)
  // console.log(request.body)

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
  if (request.file) filteredObj.photo = request.file.filename //adding photo property to obj that is updated below *here*
  const updatedUser = await User.findByIdAndUpdate(
    request.user.id,
    filteredObj, { ///HERE
      new: true,
      runValidators: true
    }
  );
  // response.locals.user = updatedUser
  response.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.getUserId = (request, response, next) => {

  request.params.id = request.user.id //getOneFactoryById may id jayegi as a param humnay protected middleware kay thru joid aie thi wo ismay set kara di
  next()
}

exports.getMe = getOneFactoryById(User)
//IF USER WANT TO DELETE HIS ACCOUT (DELETION MEANS DEACTIVATION)
exports.deleteme = catchAsync(async (request, response, next) => {
  await User.findByIdAndUpdate(request.user.id, {
    active: false
  });
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