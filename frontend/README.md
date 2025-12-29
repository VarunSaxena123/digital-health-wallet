# Digital Health Wallet - Frontend

## Overview

React-based frontend for the Digital Health Wallet application with comprehensive medical records in management.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure API URL (Optional)

Create `.env` file in frontend root:

```
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Start Development Server

```bash
npm start
```

The app will open at http://localhost:3000

## Project Structure

```
src/
├── components/       # Reusable React components
│   ├── Auth.js      # Login/Register components
│   ├── Reports.js   # Report upload and list
│   ├── Vitals.js    # Vital measurements and charts
│   ├── Share.js     # Sharing functionality
│   └── Common.js    # Common UI components
├── pages/           # Page components
│   └── Dashboard.js # Main dashboard page
├── services/        # API services
│   └── api.js       # Axios API client
├── hooks/           # Custom React hooks
│   └── useAuth.js   # Auth and form hooks
├── styles/          # CSS styles
│   └── global.css   # Global styles
├── App.js           # Main app component with routing
└── index.js         # React entry point
```

## Features

### Authentication

- User registration with email validation
- Secure login with JWT tokens
- Token persistence across sessions
- Protected routes with automatic redirection

### Medical Reports

- Upload PDF and image files
- Categorize by report type (Lab, X-Ray, Prescription, etc.)
- Add metadata (date, description)
- Download reports
- Filter by date range and type

### Vitals Tracking

- Record multiple vital measurements:
  - Blood Pressure
  - Heart Rate
  - Temperature
  - Blood Glucose
  - Oxygen Saturation
  - Weight
  - Height
- Interactive charts with Recharts
- Statistics (average, min, max, current)
- Customizable time periods (7/30/90/365 days)

### Report Sharing

- Share reports with other users
- Role-based access (Viewer/Editor)
- Revoke sharing permissions
- View reports shared with you
- Manage sharing access levels

### User Profile

- Update profile information
- Change full name and date of birth
- View account details

## Components

### Auth Components

- `Login` - User login form
- `Register` - User registration form

### Reports Components

- `UploadReport` - Upload medical files
- `ReportsList` - Display and manage reports

### Vitals Components

- `AddVital` - Record vital measurements
- `VitalsChart` - Display trends and statistics

### Share Components

- `ShareReport` - Share report with users
- `ManageShares` - Manage sharing access
- `SharedWithMe` - View shared reports

### Common Components

- `Alert` - Alert notifications
- `Card` - Card container
- `Modal` - Modal dialog
- `LoadingButton` - Button with loading state
- `EmptyState` - Empty state placeholder
- `Spinner` - Loading spinner

## Custom Hooks

### useAuth

- `login()` - Set authenticated user
- `logout()` - Clear authentication
- `user` - Current user object
- `token` - JWT token
- `isAuthenticated` - Authentication status

### useForm

- `values` - Form field values
- `handleChange()` - Input change handler
- `handleSubmit()` - Form submit handler
- `loading` - Loading state
- `error` - Error message

### useLoading

- `loading` - Loading state
- `error` - Error message
- `withLoading()` - Async operation wrapper
- `clearError()` - Clear error message

## API Service

Centralized API client with:

- Base URL configuration
- Automatic token injection
- Error handling
- Request/response interceptors

## Styling

Global CSS with:

- Color variables
- Button styles
- Form styling
- Card layouts
- Grid utilities
- Responsive design

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
