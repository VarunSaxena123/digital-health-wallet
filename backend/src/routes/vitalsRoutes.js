const express = require('express');
const {
  addVital,
  getVitals,
  getVitalTypes,
  getVitalSummary,
  deleteVital
} = require('../controllers/vitalsController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(authMiddleware);

/**
 * Vitals management routes
 */
router.post('/', addVital);
router.get('/types', getVitalTypes);
router.get('/summary/:vital_type', getVitalSummary);
router.get('/', getVitals);
router.delete('/:vitalId', deleteVital);

module.exports = router;
