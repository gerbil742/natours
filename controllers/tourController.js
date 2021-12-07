const Tour = require('../models/tourModel');

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

exports.checkTour = (req, res, next) => {
  const tour = req.body;

  const { price } = tour;
  if (!req.body.name || price == null) {
    return res.status(400).json({
      status: 'fail',
      message: 'Missing name or Price',
    });
  }

  next();
};

exports.getAllTours = (req, res) => {
  // res.status(200).json({
  //   status: 'success',
  //   results: tours.length,
  //   requestedAt: req.requestTime,
  //   data: {
  //     tours: tours,
  //   },
  // });
};

exports.getTour = (req, res) => {
  const id = req.params.id * 1; // trick to convert string to number

  //const tour = tours.find((el) => el.id === id);

  // res.status(200).json({
  //   status: 'success',
  //   data: {
  //     tour, // es6. both fields are teh same so only 1 is needed
  //   },
  // });
};

exports.createTour = (req, res) => {
  console.log(req.body);
  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated tour here>',
    },
  });
};

exports.updateTour = (req, res) => {
  // eslint-disable-next-line eqeqeq
  //const tour = tours.find((el) => el.id == req.params.id);

  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated tour here>',
    },
  });
};

exports.deleteTour = (req, res) => {
  // eslint-disable-next-line eqeqeq
  //const tour = tours.find((el) => el.id == req.params.id);

  res.status(204).json({
    status: 'success',
    data: {
      data: null,
    },
  });
};
