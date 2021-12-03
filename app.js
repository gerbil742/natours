const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express(); //the express() will add a bunch of methods to our app variable

// MIDDLEWAREs
// THese are 'middleware'. basically just a fucntion that can modify the incoming request data. called middleware because it stands between the request and the response
app.use(morgan('dev')); // 3rd party middleware for getting more info about our requstes
app.use(express.json());

// We can create our own middlewares to add to teh middleware stack. if we include a 3rd argument, express knows that we are defining a middleware
// Important to know that the Order matters of any middleware. If i were to include this func below my routes, then this would never get cdalled
app.use((req, res, next) => {
  console.log('Hello form the middleware');
  // You need to call next() because otherwise the code wil just be stuck here
  next();
});

app.use((req, res, next) => {
  // adding a property to the req object that contains the current time of the request. Using middleware like this is a good way to add some additional into to our request
  req.requestTime = new Date().toISOString();
  next();
});

// ROUTES
// here we enable a middlewear function called tourRouter to be used on the specific route /api/v1/tours
// when a request hits the server, it will go down the middleware stack untill it higs this function. if the route matches, it will then call the tourRouter() middleware func below
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter); // this is called mounting the handler. mounting a new router (userRouter) on a route (/api/v1/user)

// We now have everything that is the application configuration in its own stand alone file
module.exports = app;
