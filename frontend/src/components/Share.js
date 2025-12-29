import React, { useState, useEffect, useCallback } from 'react';
import { sharesAPI } from '../services/api';
import { useLoading, useForm } from '../hooks/useAuth';
import { Card, Alert, EmptyState, LoadingButton } from './Common';

/**
 * Share Report Component
 */
export const ShareReport = ({ reportId, onSuccess }) => {
  const [alert, setAlert] = useState({ type: '', message: '' });
  const { loading, withLoading } = useLoading();

  const { values, handleChange, handleSubmit, resetForm } = useForm(
    {
      shared_with_username: '',
      access_level: 'viewer'
    },
    async (formValues) => {
      await withLoading(async () => {
        await sharesAPI.shareReport(
          reportId,
          formValues.shared_with_username,
          formValues.access_level
        );
        setAlert({ type: 'success', message: 'Report shared successfully!' });
        resetForm();
        if (onSuccess) onSuccess();
      });
    }
  );

  return (
    <Card title="Share Report">
      <Alert
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ type: '', message: '' })}
      />

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Share With (Username)</label>
          <input
            type="text"
            name="shared_with_username"
            value={values.shared_with_username}
            onChange={handleChange}
            required
            placeholder="Enter username to share with"
          />
        </div>

        <div className="form-group">
          <label>Access Level</label>
          <select
            name="access_level"
            value={values.access_level}
            onChange={handleChange}
          >
            <option value="viewer">Viewer (Can only view)</option>
            <option value="editor">Editor (Can edit)</option>
          </select>
        </div>

        <LoadingButton
          loading={loading}
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%' }}
        >
          Share Report
        </LoadingButton>
      </form>
    </Card>
  );
};

/**
 * Manage Shares Component (for owner)
 */
export const ManageShares = ({ reportId }) => {
  const [shares, setShares] = useState([]);
  const [selectedAccessLevel, setSelectedAccessLevel] = useState({});
  const { loading, withLoading } = useLoading();

  const loadShares = useCallback(async () => {
    await withLoading(async () => {
      const response = await sharesAPI.getReportShares(reportId);
      setShares(response.data.shares);
    });
  }, [reportId, withLoading]);

  useEffect(() => {
    loadShares();
  }, [loadShares]);

  const handleRevokeShare = async (shareId) => {
    if (!window.confirm('Are you sure you want to revoke this share?')) return;
    await withLoading(async () => {
      await sharesAPI.revokeShare(reportId, shareId);
      setShares(shares.filter(s => s.id !== shareId));
    });
  };

  const handleUpdateAccess = async (shareId, newLevel) => {
    await withLoading(async () => {
      await sharesAPI.updateShareAccess(reportId, shareId, newLevel);
      setSelectedAccessLevel({ ...selectedAccessLevel, [shareId]: undefined });
      loadShares();
    });
  };

  return (
    <Card title="Sharing Access">
      {loading ? (
        <div className="text-center">Loading shares...</div>
      ) : shares.length === 0 ? (
        <EmptyState
          icon="🔒"
          title="Not Shared Yet"
          message="Share this report to let others view it"
        />
      ) : (
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Access Level</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {shares.map(share => (
              <tr key={share.id}>
                <td>{share.username}</td>
                <td>{share.email}</td>
                <td>
                  <select
                    value={selectedAccessLevel[share.id] || share.access_level}
                    onChange={(e) => {
                      setSelectedAccessLevel({ ...selectedAccessLevel, [share.id]: e.target.value });
                      handleUpdateAccess(share.id, e.target.value);
                    }}
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                  </select>
                </td>
                <td>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleRevokeShare(share.id)}
                  >
                    Revoke
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
};

/**
 * Shared With Me Component (view reports shared by others)
 */
export const SharedWithMe = () => {
  const [reports, setReports] = useState([]);
  const { loading, withLoading } = useLoading();

  const loadSharedReports = useCallback(async () => {
    await withLoading(async () => {
      const response = await sharesAPI.getSharedWithMe();
      setReports(response.data.reports);
    });
  }, [withLoading]);

  useEffect(() => {
    loadSharedReports();
  }, [loadSharedReports]);

  return (
    <Card title="Reports Shared With Me">
      {loading ? (
        <div className="text-center">Loading shared reports...</div>
      ) : reports.length === 0 ? (
        <EmptyState
          icon="🔗"
          title="No Shared Reports"
          message="Reports shared by other users will appear here"
        />
      ) : (
        <div className="grid grid-2">
          {reports.map(report => (
            <div
              key={report.id}
              style={{
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '16px',
                backgroundColor: '#fafafa'
              }}
            >
              <h4>{report.report_type.replace(/_/g, ' ')}</h4>
              <p style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                👤 Shared by: {report.owner_username}
              </p>
              <p style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                📅 {new Date(report.report_date).toLocaleDateString()}
              </p>
              <p style={{ fontSize: '12px', marginBottom: '12px' }}>
                <span style={{
                  display: 'inline-block',
                  padding: '4px 8px',
                  backgroundColor: '#e3f2fd',
                  color: '#1976d2',
                  borderRadius: '4px'
                }}>
                  Access: {report.access_level}
                </span>
              </p>
              {report.description && (
                <p style={{ fontSize: '12px' }}>{report.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
