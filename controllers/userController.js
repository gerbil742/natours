const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
//const AppError = require('../utils/appError');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  // EXECUTE QUERY
  const users = await User.find();

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users, // es6. both fields are teh same so only 1 is needed
    },
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Use /updatePassword'
      ),
      400
    );
  }
  // Filter out unwanted field names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');

  // 2) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true, // return the new document
    runValidators: true, // ensure all updated fields are in the proper formats
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'err',
    message: 'This route not defined',
  });
};

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'err',
    message: 'This route not defined',
  });
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'err',
    message: 'This route not defined',
  });
};

exports.deleteUser = catchAsync(async (req, res) => {
  const { id } = req.user;

  await User.findByIdAndUpdate(id, { inactive: true });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
