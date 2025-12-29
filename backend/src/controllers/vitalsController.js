const { dbAsync } = require('../models/database');

/**
 * Add vital measurement
 */
async function addVital(req, res, next) {
  try {
    const { vital_type, value, unit, measured_at, notes } = req.body;

    if (!vital_type || value === undefined || !unit) {
      return res.status(400).json({ error: 'vital_type, value, and unit are required' });
    }

    const result = await dbAsync.run(
      `INSERT INTO vitals (user_id, vital_type, value, unit, measured_at, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.userId, vital_type, value, unit, measured_at || new Date().toISOString(), notes || null]
    );

    res.status(201).json({
      message: 'Vital recorded successfully',
      vital: { id: result.id, vital_type, value, unit, measured_at }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get vitals with filters
 */
async function getVitals(req, res, next) {
  try {
    const { vital_type, from_date, to_date } = req.query;

    let query = 'SELECT * FROM vitals WHERE user_id = ?';
    const params = [req.userId];

    if (vital_type) {
      query += ' AND vital_type = ?';
      params.push(vital_type);
    }

    if (from_date) {
      query += ' AND measured_at >= ?';
      params.push(from_date);
    }

    if (to_date) {
      query += ' AND measured_at <= ?';
      params.push(to_date);
    }

    query += ' ORDER BY measured_at DESC';

    const vitals = await dbAsync.all(query, params);
    res.json({ vitals, total: vitals.length });
  } catch (err) {
    next(err);
  }
}

/**
 * Get vital types available
 */
async function getVitalTypes(req, res, next) {
  try {
    const types = await dbAsync.all(
      `SELECT DISTINCT vital_type, unit FROM vitals WHERE user_id = ? ORDER BY vital_type`,
      [req.userId]
    );

    res.json({ vital_types: types });
  } catch (err) {
    next(err);
  }
}

/**
 * Get vital summary for a specific type
 */
async function getVitalSummary(req, res, next) {
  try {
    const { vital_type } = req.params;
    const { days = 30 } = req.query;

    if (!vital_type) {
      return res.status(400).json({ error: 'vital_type is required' });
    }

    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - parseInt(days));

    const vitals = await dbAsync.all(
      `SELECT * FROM vitals 
       WHERE user_id = ? AND vital_type = ? AND measured_at >= ?
       ORDER BY measured_at ASC`,
      [req.userId, vital_type, fromDate.toISOString()]
    );

    if (vitals.length === 0) {
      return res.json({ summary: null, vitals: [] });
    }

    // Calculate statistics
    const values = vitals.map(v => v.value);
    const summary = {
      vital_type,
      count: vitals.length,
      current: vitals[vitals.length - 1].value,
      average: (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2),
      min: Math.min(...values).toFixed(2),
      max: Math.max(...values).toFixed(2),
      unit: vitals[0].unit,
      period_days: days
    };

    res.json({ summary, vitals });
  } catch (err) {
    next(err);
  }
}

/**
 * Delete vital measurement
 */
async function deleteVital(req, res, next) {
  try {
    const { vitalId } = req.params;

    const vital = await dbAsync.get(
      'SELECT * FROM vitals WHERE id = ? AND user_id = ?',
      [vitalId, req.userId]
    );

    if (!vital) {
      return res.status(404).json({ error: 'Vital not found' });
    }

    await dbAsync.run('DELETE FROM vitals WHERE id = ?', [vitalId]);
    res.json({ message: 'Vital deleted successfully' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  addVital,
  getVitals,
  getVitalTypes,
  getVitalSummary,
  deleteVital
};
