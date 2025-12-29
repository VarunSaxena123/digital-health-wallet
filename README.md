# Digital Health Wallet - Complete Application

A comprehensive full-stack web application for secure medical records management, built with Node.js/Express backend and React frontend.

## 🎯 Project Overview

Digital Health Wallet enables users to:

- Securely store and manage medical reports (PDF/Images)
- Track vital signs over time with interactive charts
- Share reports with healthcare providers and family members
- Maintain complete control over personal health data

## 📋 Tech Stack

### Backend

- **Runtime**: Node.js v18+
- **Framework**: Express.js
- **Database**: SQLite3
- **Authentication**: JWT + bcryptjs
- **File Storage**: multer (local storage)
- **CORS**: Enabled for frontend access

### Frontend

- **Library**: React 18
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Styling**: CSS3 with Grid & Flexbox

## 🚀 Quick Start

### Prerequisites

- Node.js v18 or higher
- npm or yarn package manager

### Backend Setup

1. **Navigate to backend directory**

   ```bash
   cd backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration:

   ```
   NODE_ENV=development
   PORT=5000
   JWT_SECRET=your_secure_secret_key
   DB_PATH=./database/health_wallet.db
   UPLOAD_DIR=./uploads
   MAX_FILE_SIZE=10485760
   ALLOWED_FILE_TYPES=pdf,jpg,jpeg,png
   ```

4. **Start backend server**

   ```bash
   # Development (with auto-reload)
   npm run dev

   # Production
   npm start
   ```

   Server will run at `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**

   ```bash
   cd frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure API endpoint (optional)**
   Create `.env` file:

   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. **Start frontend development server**

   ```bash
   npm start
   ```

   App will open at `http://localhost:3000`

## 📁 Project Structure

```
digital-health-wallet/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   │   ├── authController.js
│   │   │   ├── reportController.js
│   │   │   ├── vitalsController.js
│   │   │   └── shareController.js
│   │   ├── routes/          # API routes
│   │   │   ├── authRoutes.js
│   │   │   ├── reportRoutes.js
│   │   │   ├── vitalsRoutes.js
│   │   │   └── shareRoutes.js
│   │   ├── middleware/      # Express middleware
│   │   │   ├── auth.js      # JWT verification
│   │   │   └── upload.js    # File upload handling
│   │   ├── models/          # Database
│   │   │   └── database.js  # SQLite setup & schema
│   │   └── utils/           # Utility functions
│   │       └── auth.js      # Crypto & JWT helpers
│   ├── uploads/             # Uploaded files storage
│   ├── database/            # SQLite database
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
└── frontend/
    ├── src/
    │   ├── components/      # React components
    │   │   ├── Auth.js      # Login & Register
    │   │   ├── Reports.js   # Report management
    │   │   ├── Vitals.js    # Vitals tracking
    │   │   ├── Share.js     # Report sharing
    │   │   └── Common.js    # Reusable UI components
    │   ├── pages/
    │   │   └── Dashboard.js # Main dashboard
    │   ├── services/
    │   │   └── api.js       # Axios API client
    │   ├── hooks/
    │   │   └── useAuth.js   # Custom hooks
    │   ├── styles/
    │   │   └── global.css   # Global styling
    │   ├── App.js           # Main app with routing
    │   └── index.js         # React entry point
    ├── public/
    │   └── index.html       # HTML template
    ├── package.json
    └── README.md
```

## 🔐 Security Features

### Authentication & Authorization

- JWT-based authentication with 7-day expiration
- Bcryptjs password hashing (10 salt rounds)
- Protected routes requiring valid tokens
- Automatic token injection in API headers

### Data Protection

- Role-based access control (Owner/Viewer/Editor)
- File type validation (PDF, JPG, PNG only)
- File size limits (10MB default)
- Secure file storage outside web root

### Error Handling

- Comprehensive error messages
- Input validation on all endpoints
- CORS configuration for frontend access

## 📚 API Documentation

### Authentication Endpoints

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/profile        [Protected]
PUT    /api/auth/profile        [Protected]
```

### Reports Endpoints

```
POST   /api/reports/upload      [Protected]
GET    /api/reports             [Protected]
GET    /api/reports/:reportId   [Protected]
PUT    /api/reports/:reportId   [Protected]
DELETE /api/reports/:reportId   [Protected]
GET    /api/reports/:reportId/download [Protected]
```

### Vitals Endpoints

```
POST   /api/vitals              [Protected]
GET    /api/vitals              [Protected]
GET    /api/vitals/types        [Protected]
GET    /api/vitals/summary/:vital_type [Protected]
DELETE /api/vitals/:vitalId     [Protected]
```

### Sharing Endpoints

```
POST   /api/shares/reports/:reportId/share [Protected]
GET    /api/shares/shared-with-me [Protected]
GET    /api/shares/reports/:reportId/shares [Protected]
DELETE /api/shares/reports/:reportId/shares/:shareId [Protected]
PUT    /api/shares/reports/:reportId/shares/:shareId [Protected]
```

## 💾 Database Schema

### Users Table

- id, username (unique), email (unique), password_hash
- full_name, date_of_birth
- created_at, updated_at

### Reports Table

- id, user_id (FK), file_name, file_path
- file_type, report_type, report_date
- description, created_at, updated_at

### Vitals Table

- id, user_id (FK), vital_type, value
- unit, measured_at, notes, created_at

### Shares Table

- id, report_id (FK), owner_id (FK)
- shared_with_user_id (FK), access_level
- created_at, expires_at

## 🔄 Workflow Examples

### User Registration & Login

1. User registers with username, email, password
2. Password hashed with bcryptjs (10 rounds)
3. JWT token generated on login
4. Token stored in localStorage
5. Token included in all API requests

### Uploading Medical Report

1. User selects file (PDF/Image)
2. File validated for type and size
3. File saved to `uploads/` directory
4. Metadata stored in SQLite
5. Report appears in user's dashboard

### Tracking Vitals

1. User records vital measurement
2. Data stored in vitals table with timestamp
3. Historical data retrieved for selected period
4. Statistics calculated (avg, min, max)
5. Interactive chart displays trends

### Sharing Report

1. Report owner shares with username
2. Share record created in database
3. Access level set (Viewer/Editor)
4. Recipient can view shared report
5. Owner can revoke access anytime

## 🎨 UI/UX Features

### Dashboard Navigation

- Overview with quick stats
- Medical Reports tab
- Vitals Tracking tab
- Shared With Me tab
- User Profile tab

### Components

- Responsive card layouts
- Loading states with spinners
- Alert notifications (success/error/info)
- Empty states with helpful messages
- Modal dialogs for confirmations
- Interactive charts with Recharts

### Styling

- Clean, modern design
- Color-coded status indicators
- Responsive grid layouts
- Professional typography
- Consistent spacing and alignment

## 🚢 Deployment Considerations

### Backend Deployment

- Use environment-specific configs
- Secure JWT_SECRET in production
- Enable HTTPS
- Set appropriate CORS origins
- Use persistent database storage
- Implement logging and monitoring

### Frontend Deployment

- Build for production: `npm run build`
- Serve from CDN or static host
- Configure API endpoint for production
- Enable caching headers
- Optimize bundle size

## 🛠️ Development Tips

### Adding New Vitals Type

1. Add option to vitals select in `components/Vitals.js`
2. Update unit mappings in `vitalTypes` object
3. No backend changes needed (flexible schema)

### Customizing Themes

1. Update CSS variables in `styles/global.css`
2. Modify color values and spacing
3. Change button/card styles as needed

### Extending File Upload Types

1. Update `ALLOWED_FILE_TYPES` in `.env`
2. Modify file filter in `middleware/upload.js`
3. Update UI hints in upload component

## 📝 Code Quality

- Modular and DRY architecture
- Clear separation of concerns
- Comprehensive error handling
- Consistent naming conventions
- Well-commented code
- Production-ready structure

## 🐛 Troubleshooting

### Database Issues

- Check `database/` folder exists
- Verify SQLite path in `.env`
- Clear database to reset: delete `health_wallet.db`

### File Upload Issues

- Ensure `uploads/` folder is writable
- Check file size limits
- Verify file type is allowed
- Check available disk space

### API Connection Issues

- Verify backend server running on port 5000
- Check CORS configuration
- Ensure proper JWT tokens
- Verify network connectivity

### Frontend Build Issues

- Clear `node_modules/` and reinstall
- Delete `.env.local` and reconfigure
- Clear browser cache
- Check Node.js version (18+)

## 📖 Additional Resources

- [Express.js Documentation](https://expressjs.com)
- [React Documentation](https://react.dev)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [JWT Introduction](https://jwt.io)
- [Recharts Examples](https://recharts.org)

## 📄 License

This project is provided as-is for educational and development purposes.

## 🤝 Contributing

Feel free to extend and modify this application for your needs:

- Add new features
- Improve UI/UX
- Optimize performance
- Enhance security

---

**Built with ❤️ for secure health data management**
