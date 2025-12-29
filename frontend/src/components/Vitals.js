import React, { useState, useEffect, useCallback } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { vitalsAPI } from '../services/api';
import { useLoading } from '../hooks/useAuth';
import { Card, Alert, EmptyState, LoadingButton, ButtonGroup } from './Common';
import { useForm } from '../hooks/useAuth';

/**
 * Add Vital Measurement Component
 */
export const AddVital = ({ onSuccess }) => {
  const [alert, setAlert] = useState({ type: '', message: '' });
  const { loading, withLoading } = useLoading();

  const { values, handleChange, handleSubmit, resetForm } = useForm(
    {
      vital_type: 'blood_pressure',
      value: '',
      unit: 'mmHg',
      measured_at: new Date().toISOString().slice(0, 16),
      notes: ''
    },
    async (formValues) => {
      await withLoading(async () => {
        await vitalsAPI.addVital(
          formValues.vital_type,
          parseFloat(formValues.value),
          formValues.unit,
          formValues.measured_at,
          formValues.notes
        );
        setAlert({ type: 'success', message: 'Vital recorded successfully!' });
        resetForm();
        if (onSuccess) onSuccess();
      });
    }
  );

  const vitalTypes = {
    blood_pressure: 'mmHg',
    heart_rate: 'bpm',
    temperature: '°C',
    blood_glucose: 'mg/dL',
    oxygen_saturation: '%',
    weight: 'kg',
    height: 'cm'
  };

  return (
    <Card title="Record Vital">
      <Alert
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ type: '', message: '' })}
      />

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label>Vital Type</label>
            <select
              name="vital_type"
              value={values.vital_type}
              onChange={(e) => {
                handleChange(e);
                // Auto-update unit based on vital type
                const unit = vitalTypes[e.target.value] || '';
                handleChange({
                  target: { name: 'unit', value: unit }
                });
              }}
            >
              <option value="blood_pressure">Blood Pressure</option>
              <option value="heart_rate">Heart Rate</option>
              <option value="temperature">Temperature</option>
              <option value="blood_glucose">Blood Glucose</option>
              <option value="oxygen_saturation">Oxygen Saturation</option>
              <option value="weight">Weight</option>
              <option value="height">Height</option>
            </select>
          </div>

          <div className="form-group">
            <label>Value</label>
            <input
              type="number"
              step="0.1"
              name="value"
              value={values.value}
              onChange={handleChange}
              required
              placeholder="Enter value"
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label>Unit</label>
            <input
              type="text"
              name="unit"
              value={values.unit}
              onChange={handleChange}
              disabled
            />
          </div>

          <div className="form-group">
            <label>Date & Time</label>
            <input
              type="datetime-local"
              name="measured_at"
              value={values.measured_at}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Notes (Optional)</label>
          <textarea
            name="notes"
            value={values.notes}
            onChange={handleChange}
            placeholder="Any observations..."
            style={{ minHeight: '60px' }}
          />
        </div>

        <LoadingButton
          loading={loading}
          type="submit"
          className="btn btn-success"
          style={{ width: '100%' }}
        >
          Record Vital
        </LoadingButton>
      </form>
    </Card>
  );
};

/**
 * Vitals Chart Component
 */
export const VitalsChart = () => {
  const [vitalTypes, setVitalTypes] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [summary, setSummary] = useState(null);
  const [vitals, setVitals] = useState([]);
  const [days, setDays] = useState(30);
  const { loading, withLoading } = useLoading();
  const [showAddVital, setShowAddVital] = useState(false);

  const loadVitalTypes = useCallback(async () => {
    await withLoading(async () => {
      const response = await vitalsAPI.getVitalTypes();
      setVitalTypes(response.data.vital_types);
      if (response.data.vital_types.length > 0) {
        setSelectedType(response.data.vital_types[0].vital_type);
      }
    });
  }, [withLoading]);

  const loadVitalSummary = useCallback(async () => {
    if (selectedType) {
      await withLoading(async () => {
        const response = await vitalsAPI.getVitalSummary(selectedType, days);
        setSummary(response.data.summary);
        setVitals(response.data.vitals.map(v => ({
          ...v,
          date: new Date(v.measured_at).toLocaleDateString()
        })));
      });
    }
  }, [selectedType, days, withLoading]);

  useEffect(() => {
    loadVitalTypes();
  }, [loadVitalTypes]);

  useEffect(() => {
    if (selectedType) {
      loadVitalSummary();
    }
  }, [selectedType, days, loadVitalSummary]);

  return (
    <>
      {showAddVital && (
        <Card>
          <AddVital onSuccess={() => { setShowAddVital(false); loadVitalSummary(); }} />
        </Card>
      )}

      <Card title="Vitals Tracking & Charts">
        <ButtonGroup style={{ marginBottom: '20px' }}>
          <button className="btn btn-success" onClick={() => setShowAddVital(!showAddVital)}>
            {showAddVital ? '✕ Close' : '+ Record Vital'}
          </button>
        </ButtonGroup>

        {vitalTypes.length === 0 ? (
          <EmptyState
            icon="📊"
            title="No Vitals Recorded"
            message="Start recording your vitals to see charts and trends"
            action={<button className="btn btn-primary" onClick={() => setShowAddVital(true)}>
              Record First Vital
            </button>}
          />
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '20px' }}>
              <div>
                <label>Vital Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  {vitalTypes.map(vt => (
                    <option key={vt.vital_type} value={vt.vital_type}>
                      {vt.vital_type.replace(/_/g, ' ')} ({vt.unit})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>Time Period</label>
                <select
                  value={days}
                  onChange={(e) => setDays(parseInt(e.target.value))}
                >
                  <option value={7}>Last 7 days</option>
                  <option value={30}>Last 30 days</option>
                  <option value={90}>Last 90 days</option>
                  <option value={365}>Last year</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="text-center">Loading chart...</div>
            ) : summary ? (
              <>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '12px',
                  marginBottom: '24px'
                }}>
                  <div style={{
                    backgroundColor: '#f0f4ff',
                    padding: '16px',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <p style={{ fontSize: '12px', color: '#666' }}>Current</p>
                    <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#007bff' }}>
                      {summary.current} {summary.unit}
                    </p>
                  </div>
                  <div style={{
                    backgroundColor: '#f0fff0',
                    padding: '16px',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <p style={{ fontSize: '12px', color: '#666' }}>Average</p>
                    <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#28a745' }}>
                      {summary.average} {summary.unit}
                    </p>
                  </div>
                  <div style={{
                    backgroundColor: '#fff0f0',
                    padding: '16px',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <p style={{ fontSize: '12px', color: '#666' }}>Min</p>
                    <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffc107' }}>
                      {summary.min} {summary.unit}
                    </p>
                  </div>
                  <div style={{
                    backgroundColor: '#ffe0e0',
                    padding: '16px',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <p style={{ fontSize: '12px', color: '#666' }}>Max</p>
                    <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#dc3545' }}>
                      {summary.max} {summary.unit}
                    </p>
                  </div>
                </div>

                {vitals.length > 0 && (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={vitals}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" style={{ fontSize: '12px' }} />
                      <YAxis style={{ fontSize: '12px' }} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#007bff"
                        dot={{ fill: '#007bff' }}
                        name={`${selectedType.replace(/_/g, ' ')} (${summary.unit})`}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </>
            ) : (
              <EmptyState
                icon="📉"
                title="No Data Available"
                message={`No vital measurements recorded for ${selectedType.replace(/_/g, ' ')} in the selected period`}
              />
            )}
          </>
        )}
      </Card>
    </>
  );
};
