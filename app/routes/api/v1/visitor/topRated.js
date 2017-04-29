const express = require('express');
const bodyParser = require('body-parser');

const Service = require('../../../../models/service/Service');
const errorHandler = require('../../../../services/shared/errorHandler');

const router = express.Router();

/**
 * Parsing Middleware(s).
 */

router.use(bodyParser.json());

/**
 * Top rated services API route.
 */

router.get('/', (req, res, next) => {
  Service.find()
    .populate({
      path: '_business',
      select: 'name',
    })
    .select('name shortDescription _business coverImage')
    .sort('-_avgRating')
    .limit(5)
    .exec()
    .then((services) => {
      res.json({
        results: services,
      });
    })
    .catch(next);
});

/**
 * Error handling Middlewares.
 */

router.use(errorHandler);

module.exports = router;
