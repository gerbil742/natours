const fs = require('fs');

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

exports.checkID = (req, res, next, val) => {
  // eslint-disable-next-line eqeqeq
  const tour = tours.find((el) => el.id == req.params.id);
  console.log(`tour id is ${val}`);

  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: 'invalid ID',
    });
  }
  next();
};

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
  res.status(200).json({
    status: 'success',
    results: tours.length,
    requestedAt: req.requestTime,
    data: {
      tours: tours,
    },
  });
};

exports.getTour = (req, res) => {
  const id = req.params.id * 1; // trick to convert string to number

  const tour = tours.find((el) => el.id === id);

  res.status(200).json({
    status: 'success',
    data: {
      tour, // es6. both fields are teh same so only 1 is needed
    },
  });
};

exports.createTour = (req, res) => {
  console.log(req.body);

  const newID = tours[tours.length - 1].id + 1;
  const id = { id: newID };
  const newTour = Object.assign(id, req.body); // this creates a new object by merging 2 existion objects together. do it like this to not mutate the origional body object.

  tours.push(newTour);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      if (err) return console.log('error writing file');
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  );
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
