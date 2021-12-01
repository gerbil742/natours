const fs = require('fs');
const express = require('express');
const { application } = require('express');

const app = express(); //the express() will add a bunch of methods to our app variable

// experss.json() is 'middleware'. basically just a fucntion that can modify the incoming request data
// called middleware because it stands between the request and the response
app.use(express.json());

const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`));

// use v1 in order to specify the api version. you can branch off to v2 and not break the v1 of the api
// we call the callback the route handler
const getAllTours = (req, res) => {
  // Using the JSEND data specification to send json. status and data properties
  res.status(200).json({
    status: 'success', // can either have success(code 200, 201, etc), fail, or error
    results: tours.length,
    data: {
      tours: tours, // in es6 you can just write tours isf the key and the value are the same. You do need to make sure the property matches the endpoint name
    },
  });
};

// you can also have optional parameters using :id?
const getTour = (req, res) => {
  const id = req.params.id * 1; // trick to convert string to number

  const tour = tours.find((el) => el.id === id);

  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: 'invalid ID',
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
};

const createTour = (req, res) => {
  console.log(req.body);

  const newID = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newID }, req.body); // this creates a new object by merging 2 existion objects together. do it like this to not mutate the origional body object.

  tours.push(newTour);

  fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), (err) => {
    // 201 means created. 200 means OK
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  });
};

const updateTour = (req, res) => {
  const tour = tours.find((el) => el.id == req.params.id);

  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: 'invalid ID',
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated tour here>',
    },
  });
};

const deleteTour = (req, res) => {
  const tour = tours.find((el) => el.id == req.params.id);

  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: 'invalid ID',
    });
  }

  // 204 means no content
  res.status(204).json({
    status: 'success',
    data: {
      data: null,
    },
  });
};

// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id', getTour);
// app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

app.route('/api/v1/tours').get(getAllTours).post(createTour);

app.route('/api/v1/tours/:id').get(getTour).patch(updateTour).delete(deleteTour);

const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
