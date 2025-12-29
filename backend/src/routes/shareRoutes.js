const express = require('express');
const {
  shareReport,
  getSharedReports,
  getReportShares,
  revokeShare,
  updateShareAccess
} = require('../controllers/shareController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(authMiddleware);

/**
 * Share management routes
 */
router.post('/reports/:reportId/share', shareReport);
router.get('/shared-with-me', getSharedReports);
router.get('/reports/:reportId/shares', getReportShares);
router.delete('/reports/:reportId/shares/:shareId', revokeShare);
router.put('/reports/:reportId/shares/:shareId', updateShareAccess);

module.exports = router;
