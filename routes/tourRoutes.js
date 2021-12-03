const express = require('express');
const tourController = require('./../controllers/tourController');

// tourRouter is like a mini applicatoin within our own application. tourRouter has its own routes. our request will then go into here and find its appropriate route
// if the route from within tourRouter is "/:id" it will hit the id route and it will run one of the handlers.
const router = express.Router();

router
  .route('/') // We no longer need to specify the full route "/api/v1/tours" because we are using the tourRouter middleware that already specifies that we are on teh "api/v1/tours" route
  .get(tourController.getAllTours)
  .post(tourController.createTour);
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
