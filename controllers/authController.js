const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');

const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createAndSendJWT = (res, user, statusCode) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000 // conv days to milliseconds
    ),
    // secure: true, // cookie will only be sent on a encrypted connection
    httpOnly: true, // cookie cant be accessed or modified by the browser in anyway. for xss attacks
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  user.password = undefined; // removes the password fomr the output

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  createAndSendJWT(res, newUser, 201);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Chek if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // 2) Check if user exist ands pass is correct
  const user = await User.findOne({ email }).select('+password');
  //const correct = await user.correctPassword(password, user.password); Will cause an issue if the user does not exist, this line wont be able to run.

  // If !user, 2nd line wont even run
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  createAndSendJWT(res, user, 200);
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Get token and check if exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in. please log in to get access', 401)
    );
  }

  // 2) Verification of the token. will give us the payload i.e the users _id and timestamps
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // console.log(decoded);

  // 3) Check if user still exists. in case the user was deleted after the jwt was issued
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError('The User belonging to this token no longer exists', 401)
    );
  }

  // 4) Check if user changed password after the JWT was issued

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password. Please log in again', 401)
    );
  }

  // no issues. next gets called and gives access to the protected route
  req.user = currentUser;
  next();
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    // roles ['admin', 'lead-guide']
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('No user belonging to this email', 404));
  }
  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();

  await user.save({ validateBeforeSave: false });

  // 3) Send it to the user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your Password? Submit a PATCH request with your new password and password confirm to : ${resetURL}.\nIf you didn't forget your password, please ignore this email`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your Password reset token (valid for 10 mins)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later', 500)
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // get user based off the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  // if token not expired and there is a user, set new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  // update changedpasswordat property for teh user
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save(); // we want the validator to run here so we dont disable it

  // log the user in, send JWT to the client
  createAndSendJWT(res, user, 200);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) get user from collection
  const user = await User.findById(req.user._id).select('+password');
  const { password, newPassword, newPasswordConfirm } = req.body;

  // 2) check if POSTed pass is correct

  if (!(await user.correctPassword(password, user.password))) {
    return next(
      new AppError(
        'The password you entered was incorrect. Please reenter your current password',
        401
      )
    );
  }

  // 3) if pass correct, update the pass
  user.password = newPassword;
  user.passwordConfirm = newPasswordConfirm;
  await user.save();
  // await user.findByIdAndUpdate();

  // 4) log the user in.
  createAndSendJWT(res, user, 200);
});
