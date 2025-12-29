import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { Alert, Card, LoadingButton } from './Common';
import { useAuth, useForm } from '../hooks/useAuth';

/**
 * Login Component
 */
export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [alert, setAlert] = useState({ type: '', message: '' });

  const { values, handleChange, handleSubmit, loading } = useForm(
    { username: '', password: '' },
    async (formValues) => {
      try {
        const response = await authAPI.login(formValues.username, formValues.password);
        const { token, user } = response.data;
        login(user, token);
        setAlert({ type: 'success', message: 'Login successful!' });
        setTimeout(() => navigate('/dashboard'), 1500);
      } catch (error) {
        setAlert({ type: 'error', message: error.response?.data?.error || 'Login failed' });
      }
    }
  );

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto' }}>
      <Card title="Login">
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert({ type: '', message: '' })}
        />

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={values.username}
              onChange={handleChange}
              required
              placeholder="Enter your username"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={values.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>

          <LoadingButton
            loading={loading}
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            Login
          </LoadingButton>
        </form>

        <p style={{ textAlign: 'center', marginTop: '16px' }}>
          Don't have an account?{' '}
          <a href="/register" style={{ color: 'var(--primary-color)' }}>
            Register here
          </a>
        </p>
      </Card>
    </div>
  );
};

/**
 * Register Component
 */
export const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [alert, setAlert] = useState({ type: '', message: '' });

  const { values, handleChange, handleSubmit, loading } = useForm(
    {
      username: '',
      email: '',
      password: '',
      full_name: '',
      date_of_birth: ''
    },
    async (formValues) => {
      try {
        const response = await authAPI.register(
          formValues.username,
          formValues.email,
          formValues.password,
          formValues.full_name,
          formValues.date_of_birth
        );
        const { token, user } = response.data;
        login(user, token);
        setAlert({ type: 'success', message: 'Registration successful!' });
        setTimeout(() => navigate('/dashboard'), 1500);
      } catch (error) {
        setAlert({ type: 'error', message: error.response?.data?.error || 'Registration failed' });
      }
    }
  );

  return (
    <div style={{ maxWidth: '500px', margin: '50px auto' }}>
      <Card title="Register">
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert({ type: '', message: '' })}
        />

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={values.username}
              onChange={handleChange}
              required
              placeholder="Choose a username"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={values.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={values.password}
              onChange={handleChange}
              required
              placeholder="Create a password"
            />
          </div>

          <div className="form-group">
            <label>Full Name (Optional)</label>
            <input
              type="text"
              name="full_name"
              value={values.full_name}
              onChange={handleChange}
              placeholder="Your full name"
            />
          </div>

          <div className="form-group">
            <label>Date of Birth (Optional)</label>
            <input
              type="date"
              name="date_of_birth"
              value={values.date_of_birth}
              onChange={handleChange}
            />
          </div>

          <LoadingButton
            loading={loading}
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            Register
          </LoadingButton>
        </form>

        <p style={{ textAlign: 'center', marginTop: '16px' }}>
          Already have an account?{' '}
          <a href="/login" style={{ color: 'var(--primary-color)' }}>
            Login here
          </a>
        </p>
      </Card>
    </div>
  );
};
