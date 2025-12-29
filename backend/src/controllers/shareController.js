const { dbAsync } = require('../models/database');

/**
 * Share report with another user
 */
async function shareReport(req, res, next) {
  try {
    const { reportId } = req.params;
    const { shared_with_username, access_level = 'viewer', expires_at } = req.body;

    if (!shared_with_username) {
      return res.status(400).json({ error: 'shared_with_username is required' });
    }

    // Verify report ownership
    const report = await dbAsync.get(
      'SELECT * FROM reports WHERE id = ? AND user_id = ?',
      [reportId, req.userId]
    );

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Find the user to share with
    const shareUser = await dbAsync.get(
      'SELECT id FROM users WHERE username = ?',
      [shared_with_username]
    );

    if (!shareUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (shareUser.id === req.userId) {
      return res.status(400).json({ error: 'Cannot share report with yourself' });
    }

    // Create share record
    try {
      const result = await dbAsync.run(
        `INSERT INTO shares (report_id, owner_id, shared_with_user_id, access_level, expires_at)
         VALUES (?, ?, ?, ?, ?)`,
        [reportId, req.userId, shareUser.id, access_level, expires_at || null]
      );

      res.status(201).json({
        message: 'Report shared successfully',
        share: {
          id: result.id,
          report_id: reportId,
          shared_with_username,
          access_level,
          expires_at
        }
      });
    } catch (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({ error: 'Report already shared with this user' });
      }
      throw err;
    }
  } catch (err) {
    next(err);
  }
}

/**
 * Get shared reports (reports shared with current user)
 */
async function getSharedReports(req, res, next) {
  try {
    const reports = await dbAsync.all(
      `SELECT r.*, u.username as owner_username, s.access_level, s.expires_at
       FROM reports r
       JOIN shares s ON r.id = s.report_id
       JOIN users u ON r.user_id = u.id
       WHERE s.shared_with_user_id = ? 
       AND (s.expires_at IS NULL OR s.expires_at > CURRENT_TIMESTAMP)
       ORDER BY r.report_date DESC`,
      [req.userId]
    );

    res.json({ reports, total: reports.length });
  } catch (err) {
    next(err);
  }
}

/**
 * Get users this report has been shared with
 */
async function getReportShares(req, res, next) {
  try {
    const { reportId } = req.params;

    // Verify report ownership
    const report = await dbAsync.get(
      'SELECT * FROM reports WHERE id = ? AND user_id = ?',
      [reportId, req.userId]
    );

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const shares = await dbAsync.all(
      `SELECT s.*, u.username, u.email
       FROM shares s
       JOIN users u ON s.shared_with_user_id = u.id
       WHERE s.report_id = ?
       ORDER BY s.created_at DESC`,
      [reportId]
    );

    res.json({ shares, total: shares.length });
  } catch (err) {
    next(err);
  }
}

/**
 * Revoke share access
 */
async function revokeShare(req, res, next) {
  try {
    const { reportId, shareId } = req.params;

    // Verify report ownership
    const report = await dbAsync.get(
      'SELECT * FROM reports WHERE id = ? AND user_id = ?',
      [reportId, req.userId]
    );

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Verify share ownership
    const share = await dbAsync.get(
      'SELECT * FROM shares WHERE id = ? AND report_id = ? AND owner_id = ?',
      [shareId, reportId, req.userId]
    );

    if (!share) {
      return res.status(404).json({ error: 'Share not found' });
    }

    await dbAsync.run('DELETE FROM shares WHERE id = ?', [shareId]);
    res.json({ message: 'Share revoked successfully' });
  } catch (err) {
    next(err);
  }
}

/**
 * Update share access level
 */
async function updateShareAccess(req, res, next) {
  try {
    const { reportId, shareId } = req.params;
    const { access_level } = req.body;

    if (!access_level) {
      return res.status(400).json({ error: 'access_level is required' });
    }

    // Verify report ownership
    const report = await dbAsync.get(
      'SELECT * FROM reports WHERE id = ? AND user_id = ?',
      [reportId, req.userId]
    );

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Verify share ownership
    const share = await dbAsync.get(
      'SELECT * FROM shares WHERE id = ? AND report_id = ? AND owner_id = ?',
      [shareId, reportId, req.userId]
    );

    if (!share) {
      return res.status(404).json({ error: 'Share not found' });
    }

    await dbAsync.run(
      'UPDATE shares SET access_level = ? WHERE id = ?',
      [access_level, shareId]
    );

    res.json({ message: 'Share access updated successfully' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  shareReport,
  getSharedReports,
  getReportShares,
  revokeShare,
  updateShareAccess
};
