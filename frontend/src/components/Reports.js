import React, { useState, useEffect, useCallback } from 'react';
import { reportsAPI } from '../services/api';
import { useForm, useLoading } from '../hooks/useAuth';
import { Card, Alert, LoadingButton, EmptyState, ButtonGroup } from './Common';

/**
 * Upload Report Component
 */
export const UploadReport = ({ onSuccess }) => {
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [file, setFile] = useState(null);
  const { loading, error, withLoading } = useLoading();

  const { values, handleChange, handleSubmit: formSubmit, resetForm } = useForm(
    {
      report_type: 'lab_report',
      report_date: new Date().toISOString().split('T')[0],
      description: ''
    },
    async (formValues) => {
      if (!file) {
        setAlert({ type: 'error', message: 'Please select a file' });
        return;
      }

      await withLoading(async () => {
        await reportsAPI.uploadReport(
          file,
          formValues.report_type,
          formValues.report_date,
          formValues.description
        );
        setAlert({ type: 'success', message: 'Report uploaded successfully!' });
        setFile(null);
        resetForm();
        if (onSuccess) onSuccess();
      });
    }
  );

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  return (
    <Card title="Upload Medical Report">
      <Alert
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ type: '', message: '' })}
      />
      {error && <Alert type="error" message={error} onClose={() => {}} />}

      <form onSubmit={formSubmit}>
        <div className="form-group">
          <label>Select File (PDF/Image)</label>
          <input
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png"
            required
          />
          {file && <p style={{ fontSize: '12px', color: 'green', marginTop: '4px' }}>✓ {file.name}</p>}
        </div>

        <div className="form-group">
          <label>Report Type</label>
          <select
            name="report_type"
            value={values.report_type}
            onChange={handleChange}
            required
          >
            <option value="lab_report">Lab Report</option>
            <option value="x_ray">X-Ray</option>
            <option value="prescription">Prescription</option>
            <option value="discharge_summary">Discharge Summary</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label>Report Date</label>
          <input
            type="date"
            name="report_date"
            value={values.report_date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Description (Optional)</label>
          <textarea
            name="description"
            value={values.description}
            onChange={handleChange}
            placeholder="Add any notes about this report..."
          />
        </div>

        <LoadingButton
          loading={loading}
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%' }}
        >
          Upload Report
        </LoadingButton>
      </form>
    </Card>
  );
};

/**
 * Reports List Component
 */
export const ReportsList = () => {
  const [reports, setReports] = useState([]);
  const [filters, setFilters] = useState({
    report_type: '',
    from_date: '',
    to_date: ''
  });
  const { loading, withLoading } = useLoading();
  const [showUpload, setShowUpload] = useState(false);

  const loadReports = useCallback(async () => {
    await withLoading(async () => {
      const response = await reportsAPI.getReports(
        filters.report_type,
        filters.from_date,
        filters.to_date
      );
      setReports(response.data.reports);
    });
  }, [filters, withLoading]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleDelete = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    await withLoading(async () => {
      await reportsAPI.deleteReport(reportId);
      setReports(reports.filter(r => r.id !== reportId));
    });
  };

  const handleDownload = async (reportId, fileName) => {
    await withLoading(async () => {
      const response = await reportsAPI.downloadReport(reportId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    });
  };

  return (
    <>
      {showUpload && (
        <Card>
          <UploadReport onSuccess={() => { setShowUpload(false); loadReports(); }} />
        </Card>
      )}

      <Card title="Medical Reports">
        <ButtonGroup style={{ marginBottom: '20px' }}>
          <button className="btn btn-primary" onClick={() => setShowUpload(!showUpload)}>
            {showUpload ? '✕ Close' : '+ Upload Report'}
          </button>
        </ButtonGroup>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
          <select
            style={{ padding: '8px' }}
            onChange={(e) => setFilters({ ...filters, report_type: e.target.value })}
          >
            <option value="">All Types</option>
            <option value="lab_report">Lab Report</option>
            <option value="x_ray">X-Ray</option>
            <option value="prescription">Prescription</option>
            <option value="discharge_summary">Discharge Summary</option>
          </select>
          <input
            type="date"
            placeholder="From date..."
            onChange={(e) => setFilters({ ...filters, from_date: e.target.value })}
          />
          <input
            type="date"
            placeholder="To date..."
            onChange={(e) => setFilters({ ...filters, to_date: e.target.value })}
          />
        </div>

        {loading ? (
          <div className="text-center"><span>Loading reports...</span></div>
        ) : reports.length === 0 ? (
          <EmptyState
            icon="📄"
            title="No Reports Yet"
            message="Upload your first medical report to get started"
          />
        ) : (
          <div className="grid grid-2">
            {reports.map(report => (
              <div key={report.id} style={{
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '16px',
                backgroundColor: '#fafafa'
              }}>
                <h4 style={{ marginBottom: '8px' }}>{report.report_type.replace(/_/g, ' ')}</h4>
                <p style={{ fontSize: '12px', color: '#666' }}>
                  📅 {new Date(report.report_date).toLocaleDateString()}
                </p>
                {report.description && (
                  <p style={{ fontSize: '12px', marginTop: '8px' }}>{report.description}</p>
                )}
                <ButtonGroup style={{ marginTop: '12px' }}>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleDownload(report.id, report.file_name)}
                  >
                    Download
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(report.id)}
                  >
                    Delete
                  </button>
                </ButtonGroup>
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
};
