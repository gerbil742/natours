const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express(); // the express() will add a bunch of methods to our app variable

// MIDDLEWAREs
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // 3rd party middleware for getting more info about our requstes
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`)); // serving static files

// creating our own middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString(); // adding a property to the req object
  next();
});

// ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// Page not found catch all
app.all('*', (req, res, next) => {
  const err = new Error(`Cant find ${req.originalUrl} on this server!`);
  err.status = 'fail';
  err.statusCode = 404;

  next(err);
});

app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
});

module.exports = app;
