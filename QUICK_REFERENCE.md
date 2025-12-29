# 🚀 Quick Reference Guide - Digital Health Wallet

## Getting Started (5 minutes)

### 1. Install Backend

```bash
cd backend
npm install
npm run dev
# Backend runs on http://localhost:5000
```

### 2. Install Frontend

```bash
cd frontend
npm install
npm start
# Frontend opens at http://localhost:3000
```

### 3. Create Test Account

1. Click "Register here" on login page
2. Fill in credentials
3. Click "Register"
4. Auto-redirected to dashboard

---

## Common Tasks

### Upload a Medical Report

1. Go to Dashboard → Medical Reports tab
2. Click "+ Upload Report"
3. Select file (PDF/JPG/PNG)
4. Choose report type
5. Set date and optional description
6. Click "Upload Report"

### Record Vitals

1. Go to Dashboard → Vitals Tracking tab
2. Click "+ Record Vital"
3. Select vital type (Blood Pressure, Heart Rate, etc.)
4. Enter value
5. Unit auto-fills
6. Set date/time
7. Add optional notes
8. Click "Record Vital"

### View Charts

1. Go to Dashboard → Vitals Tracking tab
2. Charts show data for selected vital type
3. Change "Time Period" dropdown to view different ranges
4. Statistics cards show current/average/min/max values

### Share Report with Others

1. Go to Dashboard → Medical Reports tab
2. On any report card, note report details
3. Share functionality: Contact receiver and ask them to register
4. Once they have account, go to Dashboard → Shared With Me
5. They'll see reports you share (feature for future enhancement)

### Update Profile

1. Go to Dashboard → Profile tab
2. Click "Edit Profile"
3. Update Full Name and Date of Birth
4. Click "Save"

---

## API Quick Reference

### Authentication

```javascript
// Register
POST /api/auth/register
{
  username: "john_doe",
  email: "john@example.com",
  password: "secure123",
  full_name: "John Doe",
  date_of_birth: "1990-01-15"
}

// Login
POST /api/auth/login
{
  username: "john_doe",
  password: "secure123"
}
// Returns: { token, user }

// Get Profile
GET /api/auth/profile
// Headers: Authorization: Bearer <token>
```

### Reports

```javascript
// Upload Report
POST /api/reports/upload (multipart/form-data)
{
  file: File,
  report_type: "lab_report",
  report_date: "2024-01-15",
  description: "Annual checkup"
}

// Get Reports
GET /api/reports?report_type=lab_report&from_date=2024-01-01&to_date=2024-12-31

// Download Report
GET /api/reports/:reportId/download

// Delete Report
DELETE /api/reports/:reportId
```

### Vitals

```javascript
// Record Vital
POST /api/vitals
{
  vital_type: "blood_pressure",
  value: 120,
  unit: "mmHg",
  measured_at: "2024-01-15T10:30:00",
  notes: "After exercise"
}

// Get Vitals
GET /api/vitals?vital_type=blood_pressure&from_date=2024-01-01

// Get Summary
GET /api/vitals/summary/blood_pressure?days=30
```

### Sharing

```javascript
// Share Report
POST /api/shares/reports/:reportId/share
{
  shared_with_username: "jane_doe",
  access_level: "viewer"
}

// Get Reports Shared With Me
GET /api/shares/shared-with-me

// Revoke Share
DELETE /api/shares/reports/:reportId/shares/:shareId
```

---

## Database Queries (SQLite)

```sql
-- Get all reports for user
SELECT * FROM reports WHERE user_id = ? ORDER BY report_date DESC;

-- Get vitals for last 30 days
SELECT * FROM vitals
WHERE user_id = ?
AND vital_type = ?
AND measured_at >= datetime('now', '-30 days')
ORDER BY measured_at DESC;

-- Get vital statistics
SELECT
  COUNT(*) as count,
  AVG(value) as average,
  MIN(value) as minimum,
  MAX(value) as maximum,
  value as current
FROM vitals
WHERE user_id = ? AND vital_type = ?
ORDER BY measured_at DESC LIMIT 1;

-- Get shared reports for user
SELECT r.*, u.username as owner_username
FROM reports r
JOIN shares s ON r.id = s.report_id
JOIN users u ON r.user_id = u.id
WHERE s.shared_with_user_id = ?
AND (s.expires_at IS NULL OR s.expires_at > datetime('now'));
```

---

## File Locations

### Key Backend Files

- Entry Point: `backend/src/index.js`
- Auth Logic: `backend/src/controllers/authController.js`
- Report Handling: `backend/src/controllers/reportController.js`
- Database: `backend/src/models/database.js`
- Uploaded Files: `backend/uploads/`
- Database File: `backend/database/health_wallet.db`

### Key Frontend Files

- Main App: `frontend/src/App.js`
- Dashboard: `frontend/src/pages/Dashboard.js`
- API Service: `frontend/src/services/api.js`
- Custom Hooks: `frontend/src/hooks/useAuth.js`
- Components: `frontend/src/components/`
- Styles: `frontend/src/styles/global.css`

---

## Environment Variables

### Backend (.env)

```
NODE_ENV=development
PORT=5000
JWT_SECRET=change_this_to_random_string
DB_PATH=./database/health_wallet.db
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,jpg,jpeg,png
```

### Frontend (.env optional)

```
REACT_APP_API_URL=http://localhost:5000/api
```

---

## Component Props & Usage

### Alert Component

```jsx
<Alert
  type="success" // 'success', 'error', 'info'
  message="Operation successful!"
  onClose={() => setAlert({ type: "", message: "" })}
/>
```

### Card Component

```jsx
<Card title="Medical Reports">{/* Content */}</Card>
```

### Modal Component

```jsx
<Modal
  isOpen={true}
  title="Delete Report?"
  onClose={closeModal}
  onConfirm={handleDelete}
  confirmText="Delete"
>
  Are you sure? This cannot be undone.
</Modal>
```

### LoadingButton

```jsx
<LoadingButton
  loading={isLoading}
  onClick={handleSubmit}
  className="btn btn-primary"
>
  Submit
</LoadingButton>
```

---

## Hook Usage Examples

### useAuth Hook

```javascript
const { user, token, isAuthenticated, login, logout } = useAuth();

// Login
login({ id: 1, username: "john" }, "token123");

// Logout
logout();

// Check auth
if (isAuthenticated) {
  /* show dashboard */
}
```

### useForm Hook

```javascript
const { values, handleChange, handleSubmit, loading, error } = useForm(
  { email: '', password: '' },
  async (formValues) => {
    await api.login(formValues);
  }
);

// In JSX
<input name="email" value={values.email} onChange={handleChange} />
<form onSubmit={handleSubmit}> ... </form>
```

### useLoading Hook

```javascript
const { loading, error, withLoading } = useLoading();

const handleSubmit = async () => {
  await withLoading(async () => {
    await api.doSomething();
  });
};
```

---

## Debugging Tips

### Backend Issues

1. Check logs in terminal
2. Verify `.env` configuration
3. Check database exists: `database/health_wallet.db`
4. Verify JWT_SECRET is set
5. Check file upload permissions

### Frontend Issues

1. Open DevTools (F12)
2. Check Console for errors
3. Check Network tab for API calls
4. Verify API_URL is correct
5. Check localStorage for token

### Database Issues

1. Delete `database/health_wallet.db` to reset
2. Check SQLite file permissions
3. Verify disk space available
4. Check file path in `.env`

---

## Performance Tips

### Backend

- Add database indexes for frequently queried fields
- Implement pagination for large result sets
- Cache frequently accessed data
- Use connection pooling for databases

### Frontend

- Use React.memo for expensive components
- Implement lazy loading with React.lazy
- Optimize bundle size
- Use code splitting with React Router

---

## Security Checklist

- [ ] Change JWT_SECRET to random string in production
- [ ] Use HTTPS in production
- [ ] Set secure CORS origins
- [ ] Implement rate limiting
- [ ] Add input validation
- [ ] Sanitize user inputs
- [ ] Use environment variables for secrets
- [ ] Keep dependencies updated
- [ ] Regular security audits

---

## Useful Commands

### Backend

```bash
npm install              # Install dependencies
npm start                # Production mode
npm run dev              # Development mode (with nodemon)
npm test                 # Run tests (if configured)
```

### Frontend

```bash
npm install              # Install dependencies
npm start                # Development server
npm run build            # Production build
npm test                 # Run tests
npm run eject            # Eject from CRA (one-way)
```

### Database

```bash
# Connect to SQLite database
sqlite3 backend/database/health_wallet.db

# SQL commands
.tables                  # Show tables
.schema users            # Show table schema
SELECT * FROM users;     # Query data
.exit                    # Exit sqlite3
```

### System

```bash
# Kill process on port
lsof -ti :5000 | xargs kill -9  # MacOS/Linux
netstat -ano | findstr :5000     # Windows (find PID)
taskkill /PID <PID> /F           # Windows (kill)
```

---

## Common Errors & Solutions

| Error                    | Cause                        | Solution                                   |
| ------------------------ | ---------------------------- | ------------------------------------------ |
| PORT 5000 already in use | Another app on port          | Kill process or change PORT in .env        |
| Cannot find module       | Dependencies not installed   | Run `npm install`                          |
| Database locked          | File permissions             | Check folder permissions                   |
| JWT verification failed  | Invalid/expired token        | Login again                                |
| CORS error               | Different origin             | Check CORS config in backend               |
| File upload fails        | File too large or wrong type | Check MAX_FILE_SIZE and ALLOWED_FILE_TYPES |
| Cannot find reports      | Wrong user context           | Verify user_id in JWT token                |

---

## Resources & Documentation

- **Main README**: See [README.md](./README.md)
- **Backend Guide**: See [backend/README.md](./backend/README.md)
- **Frontend Guide**: See [frontend/README.md](./frontend/README.md)
- **Architecture Details**: See [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Implementation Details**: See [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)

---

## Next Development Steps

1. **Testing**

   - Add unit tests for controllers
   - Add integration tests for API
   - Add component tests for React

2. **Features**

   - Add password reset
   - Add email verification
   - Add 2FA
   - Add advanced analytics

3. **Deployment**

   - Setup Docker
   - Configure cloud hosting
   - Setup CI/CD pipeline
   - Database backup strategy

4. **Enhancement**
   - Move to PostgreSQL
   - Add caching layer (Redis)
   - Implement file storage (S3)
   - Add real-time notifications

---

**Happy coding! 🚀**

For detailed documentation, check the README files in each folder.
