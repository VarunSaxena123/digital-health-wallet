import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { authAPI } from '../services/api';
import { Card, Alert } from '../components/Common';
import { ReportsList } from '../components/Reports';
import { VitalsChart } from '../components/Vitals';
import { SharedWithMe } from '../components/Share';

/**
 * Profile Component
 */
export const Profile = () => {
  const { user } = useAuth();
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(user);

  const handleSave = async () => {
    try {
      await authAPI.updateProfile(profile.full_name, profile.date_of_birth);
      setAlert({ type: 'success', message: 'Profile updated successfully!' });
      setIsEditing(false);
    } catch (error) {
      setAlert({ type: 'error', message: error.response?.data?.error || 'Update failed' });
    }
  };

  return (
    <Card title="User Profile">
      <Alert
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ type: '', message: '' })}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <label>Username</label>
          <p style={{ padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
            {profile?.username}
          </p>
        </div>

        <div>
          <label>Email</label>
          <p style={{ padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
            {profile?.email}
          </p>
        </div>

        {isEditing ? (
          <>
            <div>
              <label>Full Name</label>
              <input
                type="text"
                value={profile?.full_name || ''}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              />
            </div>

            <div>
              <label>Date of Birth</label>
              <input
                type="date"
                value={profile?.date_of_birth || ''}
                onChange={(e) => setProfile({ ...profile, date_of_birth: e.target.value })}
              />
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '8px' }}>
              <button className="btn btn-primary" onClick={handleSave}>
                Save
              </button>
              <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <div>
              <label>Full Name</label>
              <p style={{ padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
                {profile?.full_name || '-'}
              </p>
            </div>

            <div>
              <label>Date of Birth</label>
              <p style={{ padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
                {profile?.date_of_birth || '-'}
              </p>
            </div>

            <button
              className="btn btn-primary"
              onClick={() => setIsEditing(true)}
              style={{ gridColumn: '1 / -1' }}
            >
              Edit Profile
            </button>
          </>
        )}
      </div>
    </Card>
  );
};

/**
 * Dashboard Component
 */
export const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="container" style={{ marginTop: '24px' }}>
      <h1 style={{ marginBottom: '24px' }}>Welcome, {user?.full_name || user?.username}! 👋</h1>

      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        borderBottom: '1px solid var(--border-color)',
        overflow: 'auto'
      }}>
        {[
          { id: 'overview', label: '📊 Overview' },
          { id: 'reports', label: '📄 Medical Reports' },
          { id: 'vitals', label: '💓 Vitals Tracking' },
          { id: 'shared', label: '🔗 Shared With Me' },
          { id: 'profile', label: '👤 Profile' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 20px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              borderBottom: activeTab === tab.id ? '3px solid var(--primary-color)' : 'none',
              color: activeTab === tab.id ? 'var(--primary-color)' : 'var(--text-color)',
              fontSize: '14px',
              fontWeight: 'bold',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <Card title="Dashboard Overview">
          <div className="grid grid-2" style={{ marginBottom: '24px' }}>
            <div style={{
              backgroundColor: '#e3f2fd',
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📄</div>
              <p style={{ fontSize: '12px', color: '#666' }}>Medical Reports</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1976d2' }}>Ready to view</p>
            </div>

            <div style={{
              backgroundColor: '#f3e5f5',
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📊</div>
              <p style={{ fontSize: '12px', color: '#666' }}>Vital Metrics</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#7b1fa2' }}>Track progress</p>
            </div>
          </div>

          <div style={{
            backgroundColor: '#fff3e0',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <h3 style={{ marginBottom: '8px' }}>🔐 Your Data is Secure</h3>
            <p>
              All your medical records are securely stored and encrypted. You control who has access to your data.
            </p>
          </div>

          <div style={{
            backgroundColor: '#e8f5e9',
            padding: '20px',
            borderRadius: '8px'
          }}>
            <h3 style={{ marginBottom: '8px' }}>💡 Quick Tips</h3>
            <ul style={{ marginLeft: '20px' }}>
              <li>Upload medical reports to organize your health documents</li>
              <li>Record daily vitals to track trends over time</li>
              <li>Share reports with healthcare providers or family members</li>
              <li>View interactive charts to monitor your health metrics</li>
            </ul>
          </div>
        </Card>
      )}

      {activeTab === 'reports' && <ReportsList />}

      {activeTab === 'vitals' && <VitalsChart />}

      {activeTab === 'shared' && <SharedWithMe />}

      {activeTab === 'profile' && <Profile />}
    </div>
  );
};
