# Digital Health Wallet - Backend

## Overview

This is the backend API for the Digital Health Wallet application, built with Node.js and Express.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

Key variables:

- `JWT_SECRET` - Secret key for JWT tokens (change in production)
- `PORT` - Server port (default: 5000)
- `DB_PATH` - SQLite database path
- `UPLOAD_DIR` - Directory for file uploads

### 3. Start Server

Development mode (with auto-reload):

```bash
npm run dev
```

Production mode:

```bash
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)

### Reports

- `POST /api/reports/upload` - Upload medical report (protected)
- `GET /api/reports` - Get user's reports (protected)
- `GET /api/reports/:reportId` - Get single report (protected)
- `PUT /api/reports/:reportId` - Update report metadata (protected)
- `DELETE /api/reports/:reportId` - Delete report (protected)
- `GET /api/reports/:reportId/download` - Download report file (protected)

### Vitals

- `POST /api/vitals` - Add vital measurement (protected)
- `GET /api/vitals` - Get vitals with filters (protected)
- `GET /api/vitals/types` - Get distinct vital types (protected)
- `GET /api/vitals/summary/:vital_type` - Get vital summary (protected)
- `DELETE /api/vitals/:vitalId` - Delete vital measurement (protected)

### Sharing

- `POST /api/shares/reports/:reportId/share` - Share report with user (protected)
- `GET /api/shares/shared-with-me` - Get reports shared with you (protected)
- `GET /api/shares/reports/:reportId/shares` - Get users this report is shared with (protected)
- `DELETE /api/shares/reports/:reportId/shares/:shareId` - Revoke share (protected)
- `PUT /api/shares/reports/:reportId/shares/:shareId` - Update share access level (protected)

## Database Schema

### users

- id, username, email, password_hash, full_name, date_of_birth, created_at, updated_at

### reports

- id, user_id, file_name, file_path, file_type, report_type, report_date, description, created_at, updated_at

### vitals

- id, user_id, vital_type, value, unit, measured_at, notes, created_at

### shares

- id, report_id, owner_id, shared_with_user_id, access_level, created_at, expires_at

## Authentication

All protected endpoints require JWT token in Authorization header:

```
Authorization: Bearer <token>
```

## File Upload

- Supported formats: PDF, JPG, JPEG, PNG
- Max file size: 10MB (configurable)
- Files stored in `uploads/` directory

## Security Features

- Password hashing with bcryptjs (10 salt rounds)
- JWT token-based authentication
- Role-based access control (Owner/Viewer)
- File type validation
- File size limits
