const catchAsync = require("../utils/catchAsync");
const { AppError } = require("../utils/Error");


//FACTORY FUNCTIONS
//FACTORY FUNCTIONS ARE FUNCTIONS THAT RETURN A FUNCTION

exports.deleteFactory = (Model) => catchAsync(async (request, response, next) => {
    const doc = await Model.findByIdAndDelete(request.params.id);
    if (!doc) {
      return next(new AppError('No doc with this ID found', 404));
    }
    return response.status(200).json({
      status: 'Success ',
      message: 'Succesfully deleted',
    });
  });
  