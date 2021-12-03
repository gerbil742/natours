const express = require('express');
const tourController = require('./../controllers/tourController');

const router = express.Router();

router.param('id', tourController.checkID); // checkID() gets added to the middleware stack

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.checkTour, tourController.createTour); // chaining multiple middlewares together
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
