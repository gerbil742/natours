const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit').default; // needed .default for some reason
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express(); // the express() will add a bunch of methods to our app variable

// global MIDDLEWAREs

// Set Secruity HTTP headers
app.use(helmet()); // the helmet function returns a function

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // 3rd party middleware for getting more info about our requstes
}

// Limit requests form same api
const limiter = rateLimit({
  max: 100,
  windowM: 60 * 60 * 1000, // will allow 100 requests form the same ip in one hour
  message: 'Too many requests form this IP, please try again in one hour',
});
app.use('/api', limiter);

// Body Parser, reading data from the body into req.body
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// DAata sanitization against XSS
app.use(xss());

// serving static files
app.use(express.static(`${__dirname}/public`));

// creating our own middleware. testing
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString(); // adding a property to the req object
  next();
});

// prevent Parameter Pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// Page not found catch all
app.all('*', (req, res, next) => {
  next(new AppError(`Cant find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
