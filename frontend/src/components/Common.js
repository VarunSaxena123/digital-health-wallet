import React from 'react';
import '../styles/global.css';

/**
 * Alert Component
 */
export const Alert = ({ type = 'info', message, onClose }) => {
  React.useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className={`alert alert-${type}`}>
      <span>{message}</span>
      <button
        onClick={onClose}
        style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer' }}
      >
        ✕
      </button>
    </div>
  );
};

/**
 * Loading Spinner Component
 */
export const Spinner = ({ size = 'medium' }) => {
  const sizes = { small: '30px', medium: '40px', large: '60px' };
  return <div className="spinner" style={{ width: sizes[size], height: sizes[size] }} />;
};

/**
 * Card Component
 */
export const Card = ({ title, children, className = '' }) => {
  return (
    <div className={`card ${className}`}>
      {title && (
        <div className="card-header">
          <h2 className="card-title">{title}</h2>
        </div>
      )}
      {children}
    </div>
  );
};

/**
 * Button Group Component
 */
export const ButtonGroup = ({ children, className = '' }) => {
  return (
    <div className={`flex ${className}`} style={{ gap: '8px' }}>
      {children}
    </div>
  );
};

/**
 * Loading Button Component
 */
export const LoadingButton = ({ loading, onClick, children, className = '', ...props }) => {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={className}
      {...props}
    >
      {loading ? <Spinner size="small" /> : children}
    </button>
  );
};

/**
 * Form Error Display
 */
export const FormError = ({ error, field }) => {
  if (!error || (field && !error[field])) return null;
  return (
    <div className="text-danger" style={{ fontSize: '12px', marginTop: '4px' }}>
      {field ? error[field] : error}
    </div>
  );
};

/**
 * Modal Component
 */
export const Modal = ({ isOpen, title, children, onClose, onConfirm, confirmText = 'Confirm' }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '24px',
        maxWidth: '500px',
        width: '90%',
        boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
      }}>
        <h2 style={{ marginBottom: '16px' }}>{title}</h2>
        <div style={{ marginBottom: '24px' }}>
          {children}
        </div>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          {onConfirm && (
            <button className="btn btn-primary" onClick={onConfirm}>
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Empty State Component
 */
export const EmptyState = ({ icon = '📭', title, message, action }) => {
  return (
    <div style={{
      textAlign: 'center',
      padding: '40px 20px',
      color: '#999'
    }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>{icon}</div>
      <h3>{title}</h3>
      <p style={{ marginTop: '8px', marginBottom: '24px' }}>{message}</p>
      {action}
    </div>
  );
};

/**
 * Badge Component
 */
export const Badge = ({ text, type = 'info', className = '' }) => {
  const typeClass = `badge-${type}`;
  return (
    <span className={`badge ${typeClass} ${className}`} style={{
      display: 'inline-block',
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: 'bold',
      backgroundColor: 'var(--info-color)',
      color: 'white'
    }}>
      {text}
    </span>
  );
};
