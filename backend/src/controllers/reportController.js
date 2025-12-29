const { dbAsync } = require('../models/database');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const uploadDir = process.env.UPLOAD_DIR || './uploads';

/**
 * Upload medical report
 */
async function uploadReport(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const { report_type, report_date, description } = req.body;

    if (!report_type || !report_date) {
      // Clean up uploaded file
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
      return res.status(400).json({ error: 'Report type and date are required' });
    }

    // Save report metadata to database
    const result = await dbAsync.run(
      `INSERT INTO reports (user_id, file_name, file_path, file_type, report_type, report_date, description)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        req.userId,
        req.file.originalname,
        req.file.filename,
        req.file.mimetype,
        report_type,
        report_date,
        description || null
      ]
    );

    res.status(201).json({
      message: 'Report uploaded successfully',
      report: {
        id: result.id,
        file_name: req.file.originalname,
        report_type,
        report_date,
        description
      }
    });
  } catch (err) {
    // Clean up uploaded file on error
    if (req.file) {
      fs.unlink(req.file.path, (e) => {
        if (e) console.error('Error deleting file:', e);
      });
    }
    next(err);
  }
}

/**
 * Get all reports for user with filters
 */
async function getReports(req, res, next) {
  try {
    const { report_type, from_date, to_date } = req.query;

    let query = 'SELECT * FROM reports WHERE user_id = ?';
    const params = [req.userId];

    if (report_type) {
      query += ' AND report_type = ?';
      params.push(report_type);
    }

    if (from_date) {
      query += ' AND report_date >= ?';
      params.push(from_date);
    }

    if (to_date) {
      query += ' AND report_date <= ?';
      params.push(to_date);
    }

    query += ' ORDER BY report_date DESC';

    const reports = await dbAsync.all(query, params);
    res.json({ reports, total: reports.length });
  } catch (err) {
    next(err);
  }
}

/**
 * Get single report
 */
async function getReport(req, res, next) {
  try {
    const { reportId } = req.params;

    const report = await dbAsync.get(
      'SELECT * FROM reports WHERE id = ? AND user_id = ?',
      [reportId, req.userId]
    );

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json({ report });
  } catch (err) {
    next(err);
  }
}

/**
 * Delete report
 */
async function deleteReport(req, res, next) {
  try {
    const { reportId } = req.params;

    const report = await dbAsync.get(
      'SELECT * FROM reports WHERE id = ? AND user_id = ?',
      [reportId, req.userId]
    );

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Delete file from storage
    const filePath = path.join(uploadDir, report.file_path);
    fs.unlink(filePath, (err) => {
      if (err) console.error('Error deleting file:', err);
    });

    // Delete from database
    await dbAsync.run('DELETE FROM reports WHERE id = ?', [reportId]);

    res.json({ message: 'Report deleted successfully' });
  } catch (err) {
    next(err);
  }
}

/**
 * Download report file
 */
async function downloadReport(req, res, next) {
  try {
    const { reportId } = req.params;

    const report = await dbAsync.get(
      'SELECT * FROM reports WHERE id = ? AND user_id = ?',
      [reportId, req.userId]
    );

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const filePath = path.join(uploadDir, report.file_path);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.download(filePath, report.file_name);
  } catch (err) {
    next(err);
  }
}

/**
 * Update report metadata
 */
async function updateReport(req, res, next) {
  try {
    const { reportId } = req.params;
    const { report_type, report_date, description } = req.body;

    const report = await dbAsync.get(
      'SELECT * FROM reports WHERE id = ? AND user_id = ?',
      [reportId, req.userId]
    );

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    await dbAsync.run(
      `UPDATE reports SET report_type = ?, report_date = ?, description = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [report_type || report.report_type, report_date || report.report_date, description || report.description, reportId]
    );

    const updated = await dbAsync.get('SELECT * FROM reports WHERE id = ?', [reportId]);
    res.json({ message: 'Report updated successfully', report: updated });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  uploadReport,
  getReports,
  getReport,
  deleteReport,
  downloadReport,
  updateReport
};
