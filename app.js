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
  console.log('Hello form the middleware');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString(); // adding a property to the req object
  next();
});

// ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
