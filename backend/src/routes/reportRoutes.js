const express = require('express');
const upload = require('../middleware/upload');
const {
  uploadReport,
  getReports,
  getReport,
  deleteReport,
  downloadReport,
  updateReport
} = require('../controllers/reportController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(authMiddleware);

/**
 * Report management routes
 */
router.post('/upload', upload.single('file'), uploadReport);
router.get('/', getReports);
router.get('/:reportId', getReport);
router.put('/:reportId', updateReport);
router.delete('/:reportId', deleteReport);
router.get('/:reportId/download', downloadReport);

module.exports = router;
