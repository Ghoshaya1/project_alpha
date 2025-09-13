# 🏥 Patient Management System

A comprehensive healthcare management application built with modern web technologies, featuring patient records management, appointment scheduling, and role-based access control.

## 📋 Project Overview

The Patient Management System is a full-stack healthcare application designed to streamline patient record management for healthcare providers. Built with modern web technologies, it provides a secure, efficient, and user-friendly platform for managing patient information in clinical environments.

### 🎯 Target Users

- **Healthcare Providers**: Doctors, nurses, and medical staff managing patient care
- **Administrative Staff**: Reception and administrative personnel handling patient data
- **Healthcare Facilities**: Clinics, hospitals, and medical practices of all sizes
- **Solo Practitioners**: Individual healthcare providers managing their own practice

### 🏗️ System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │  Express.js API │    │ SQLite Database │
│                 │    │                 │    │                 │
│ • Vite Build    │◄──►│ • JWT Auth      │◄──►│ • Prisma ORM    │
│ • Modern UI     │    │ • RESTful API   │    │ • Patient Data  │
│ • Responsive    │    │ • CORS Config   │    │ • User Records  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 🔄 Development Workflow

This application follows modern development practices with:
- **Frontend-Backend Separation**: Independent development and deployment
- **API-First Design**: RESTful API with clear endpoint documentation
- **Database Migrations**: Version-controlled schema changes with Prisma
- **Environment Configuration**: Separate configs for development, testing, and production

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Local Development Setup](#-local-development-setup)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [Support](#-support)

## ✨ Features

### 🔐 **Authentication & Authorization**
- JWT-based authentication with secure token management
- Role-based access control (Admin, Doctor, Patient)
- Password hashing with bcrypt
- Session management and automatic logout

### 👥 **User Management**
- User registration and profile management
- Role assignment and permissions
- Doctor-patient relationship management
- Admin user oversight

### 🏥 **Patient Management**
- Complete patient record management (CRUD operations)
- Medical history tracking
- Insurance details management
- Doctor-patient assignment

### 📅 **Appointment System**
- Appointment booking and scheduling
- Status management (pending, confirmed, completed)
- Doctor and patient appointment views
- Appointment history tracking

### 🔒 **Security Features**
- Input validation and sanitization
- CORS protection
- Rate limiting
- Secure error handling

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: SQLite (development), PostgreSQL (production)
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Validation**: express-validator
- **Documentation**: Swagger/OpenAPI

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **UI Library**: Material-UI (MUI)
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **State Management**: React Hooks

### Development & Testing
- **Testing**: Jest + Supertest
- **Linting**: ESLint
- **Formatting**: Prettier
- **Git Hooks**: Husky
- **Documentation**: Markdown

## 🚀 Quick Start

Get the application running in 5 minutes:

```bash
# 1. Clone the repository
git clone <repository-url>
cd patient-management-system

# 2. Install dependencies
npm install
cd backend && npm install
cd ../frontend && npm install

# 3. Setup environment variables
cd backend && cp .env.example .env
cd ../frontend && cp .env.example .env

# 4. Setup database
cd backend && npx prisma generate && npx prisma db push

# 5. Start both servers
# Terminal 1 (Backend)
cd backend && npm run dev

# Terminal 2 (Frontend)
cd frontend && npm run dev
```

**Access the application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- API Documentation: http://localhost:5000/api-docs

## 💻 Local Development Setup

### Prerequisites

Ensure you have the following installed:

| Software | Version | Download |
|----------|---------|----------|
| **Node.js** | 18.0+ | [nodejs.org](https://nodejs.org/) |
| **npm** | 8.0+ | Included with Node.js |
| **Git** | 2.30+ | [git-scm.com](https://git-scm.com/) |

### Step-by-Step Setup

#### 1. **Clone and Navigate**
```bash
git clone <repository-url>
cd patient-management-system
```

#### 2. **Install Root Dependencies** (if any)
```bash
npm install
```

#### 3. **Setup Backend**
```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Or create manually:
cat > .env << EOF
NODE_ENV=development
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
DATABASE_URL="file:./prisma/database.db"
CORS_ORIGIN=http://localhost:5173
EOF

# Setup database
npx prisma generate
npx prisma db push

# Optional: Seed database with sample data
npx prisma db seed
```

#### 4. **Setup Frontend**
```bash
cd ../frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Or create manually:
cat > .env << EOF
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=Patient Management System
EOF
```

#### 5. **Start Development Servers**

**Option A: Using separate terminals (Recommended)**
```bash
# Terminal 1: Start Backend
cd backend
npm run dev
# Backend will start on http://localhost:5000

# Terminal 2: Start Frontend
cd frontend
npm run dev
# Frontend will start on http://localhost:5173
```

**Option B: Using background processes**
```bash
# Start backend in background
cd backend && npm run dev &

# Start frontend
cd frontend && npm run dev
```

#### 6. **Verify Setup**
- ✅ Backend: Visit http://localhost:5000 (should show "Patient Management System API is running...")
- ✅ Frontend: Visit http://localhost:5173 (should show login page)
- ✅ API Docs: Visit http://localhost:5000/api-docs (Swagger UI)
- ✅ Database: Run `cd backend && npx prisma studio` (database GUI)

### 🔧 Development Scripts

#### Backend Scripts
```bash
cd backend

# Development with hot reload
npm run dev

# Production mode
npm start

# Run tests
npm test
npm run test:watch     # Watch mode
npm run test:coverage  # With coverage report

# Database operations
npx prisma studio      # Database GUI
npx prisma generate    # Regenerate client
npx prisma db push     # Push schema changes
npx prisma db seed     # Seed database
```

#### Frontend Scripts
```bash
cd frontend

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Linting
npm run lint
npm run lint:fix
```

### 🌐 Accessing the Application

Once both servers are running:

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:5173 | Main application interface |
| **Backend API** | http://localhost:5000 | REST API endpoints |
| **API Documentation** | http://localhost:5000/api-docs | Swagger UI documentation |
| **Database GUI** | http://localhost:5555 | Prisma Studio (run `npx prisma studio`) |

### 👤 Default Users

If you've seeded the database, you can use these test accounts:

| Role | Email | Password | Access |
|------|-------|----------|--------|
| **Admin** | admin@test.com | admin123 | Full system access |
| **Doctor** | doctor@test.com | doctor123 | Patient and appointment management |
| **Patient** | patient@test.com | patient123 | View own records and appointments |

## 📁 Project Structure

```
patient-management-system/
├── 📁 backend/                 # Node.js/Express API
│   ├── 📁 routes/             # API route handlers
│   │   ├── authRoutes.js      # Authentication endpoints
│   │   ├── userRoutes.js      # User management
│   │   ├── patientRoutes.js   # Patient CRUD operations
│   │   └── appointmentRoutes.js # Appointment management
│   ├── 📁 middlewares/        # Custom middleware
│   │   └── authMiddleware.js  # JWT authentication
│   ├── 📁 prisma/            # Database schema & migrations
│   │   ├── schema.prisma     # Database schema
│   │   └── database.db       # SQLite database file
│   ├── 📁 tests/             # Test suites (70+ tests)
│   ├── server.js             # Express server entry point
│   ├── prismaClient.js       # Database client
│   └── package.json          # Backend dependencies
├── 📁 frontend/               # React application
│   ├── 📁 src/
│   │   ├── 📁 components/    # Reusable React components
│   │   ├── 📁 pages/         # Page components
│   │   │   ├── Login.jsx     # Login page
│   │   │   ├── Dashboard.jsx # Main dashboard
│   │   │   ├── Patients.jsx  # Patient management
│   │   │   └── Appointments.jsx # Appointment management
│   │   ├── 📁 utils/         # Utility functions
│   │   │   └── api.js        # Centralized API client
│   │   └── App.jsx           # Main app component
│   ├── 📁 public/            # Static assets
│   └── package.json          # Frontend dependencies
├── 📁 docs/                  # Documentation (15,000+ words)
│   ├── ARCHITECTURE.md       # System architecture
│   ├── API_DOCUMENTATION.md  # Complete API reference
│   ├── DEVELOPMENT_SETUP.md  # Detailed setup guide
│   └── ...                   # Additional documentation
├── DEVELOPER_ONBOARDING.md   # New developer guide
├── CONTRIBUTING.md           # Contribution guidelines
├── CHANGELOG.md              # Project changes
└── README.md                 # This file
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### User Management
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/me` - Get current user info
- `GET /api/users/my-patients` - Get doctor's patients

### Patient Management
- `POST /api/patients` - Create patient (Doctor only)
- `GET /api/patients/:id` - Get patient details
- `DELETE /api/patients/:id` - Delete patient (Doctor only)

### Appointment Management
- `POST /api/appointments` - Book appointment
- `GET /api/appointments` - Get all appointments (Admin/Doctor)
- `GET /api/appointments/my` - Get user's appointments (Patient)
- `PUT /api/appointments/:id/status` - Update appointment status

**Complete API Documentation**: Visit http://localhost:5000/api-docs or see [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)

## 🧪 Testing

The project includes comprehensive testing with >90% coverage across all components:

### Running Tests

```bash
# Backend Tests
cd backend

# Run all tests
npm test

# Run tests in watch mode (auto-rerun on changes)
npm run test:watch

# Generate detailed coverage report
npm run test:coverage

# Run specific test suite
npx jest tests/routes/patientRoutes.test.js
npx jest tests/middlewares/authMiddleware.test.js

# Run tests with verbose output
npm test -- --verbose

# Run tests matching pattern
npm test -- --testNamePattern="should create patient"
```

### Test Structure

```
backend/tests/
├── 📁 routes/                 # API endpoint tests
│   ├── authRoutes.test.js     # Authentication tests (15 tests)
│   ├── userRoutes.test.js     # User management tests (12 tests)
│   ├── patientRoutes.test.js  # Patient CRUD tests (18 tests)
│   └── appointmentRoutes.test.js # Appointment tests (20 tests)
├── 📁 middlewares/            # Middleware tests
│   └── authMiddleware.test.js # JWT validation tests (8 tests)
├── 📁 utils/                  # Utility function tests
└── setup/                     # Test configuration
    ├── testSetup.js          # Global test setup
    └── testDatabase.js       # Test database configuration
```

### Test Coverage Areas

- **Authentication & Authorization** (100% coverage)
  - User registration and login
  - JWT token validation
  - Role-based access control
  - Session management

- **Patient Management** (95% coverage)
  - Patient creation and validation
  - Patient record updates
  - Patient search and filtering
  - Data privacy and access controls

- **Appointment System** (92% coverage)
  - Appointment booking and scheduling
  - Status updates and cancellations
  - Conflict detection
  - Notification triggers

- **Database Operations** (98% coverage)
  - Prisma ORM operations
  - Data validation and constraints
  - Transaction handling
  - Error handling and rollbacks

### Test Environment

Tests run in an isolated environment with:
- **Separate Test Database**: SQLite in-memory database for fast execution
- **Mock Data**: Predefined test fixtures and factories
- **Clean State**: Database reset between test suites
- **Environment Isolation**: Separate environment variables

### Continuous Integration

```bash
# Pre-commit hooks (runs automatically)
npm run lint          # ESLint code quality checks
npm run format        # Prettier code formatting
npm test              # Full test suite

# CI Pipeline (GitHub Actions)
- Automated testing on push/PR
- Multi-node version testing (16.x, 18.x, 20.x)
- Code coverage reporting
- Security vulnerability scanning
```

**Complete Testing Guide**: See [docs/TESTING_AND_DEBUGGING.md](docs/TESTING_AND_DEBUGGING.md)

## 🚀 Deployment

### Development Deployment

Development servers run locally with hot reloading and debugging enabled:

```bash
# Development mode (recommended for local development)
cd backend && npm run dev    # Nodemon with auto-restart
cd frontend && npm run dev   # Vite dev server with HMR

# Development with debugging
cd backend && npm run dev:debug  # Node.js debugger enabled
```

### Production Deployment Options

#### Option 1: Traditional Server Deployment

```bash
# 1. Build frontend for production
cd frontend
npm run build
# Creates optimized build in dist/ directory

# 2. Configure production environment
cd backend
cp .env.example .env.production
# Edit .env.production with production values

# 3. Install production dependencies only
npm ci --only=production

# 4. Run database migrations
npx prisma db push
npx prisma generate

# 5. Start production server
NODE_ENV=production npm start
```

#### Option 2: Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build -d

# Or build individual containers
docker build -t patient-management-backend ./backend
docker build -t patient-management-frontend ./frontend

# Run containers
docker run -d -p 5000:5000 patient-management-backend
docker run -d -p 80:80 patient-management-frontend
```

#### Option 3: Cloud Platform Deployment

**Heroku Deployment**
```bash
# Install Heroku CLI and login
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-production-secret
heroku config:set DATABASE_URL=your-database-url

# Deploy
git push heroku main
```

**Vercel/Netlify (Frontend)**
```bash
# Frontend deployment to Vercel
cd frontend
vercel --prod

# Or Netlify
netlify deploy --prod --dir=dist
```

**Railway/Render (Backend)**
- Connect GitHub repository
- Set environment variables in dashboard
- Auto-deploy on push to main branch

### Environment Configuration

#### Backend Environment Variables (.env)

```bash
# Server Configuration
NODE_ENV=production                    # Environment mode
PORT=5000                             # Server port
HOST=0.0.0.0                         # Server host (for containers)

# Database Configuration
DATABASE_URL=postgresql://user:pass@host:5432/db  # Production database
# Or for SQLite: file:./database.db

# Authentication
JWT_SECRET=your-super-secure-256-bit-secret-key   # JWT signing key
JWT_EXPIRES_IN=24h                    # Token expiration

# CORS Configuration
CORS_ORIGIN=https://yourdomain.com    # Frontend URL
# Or for multiple origins: https://app.com,https://admin.com

# API Configuration
API_RATE_LIMIT=100                    # Requests per minute per IP
API_TIMEOUT=30000                     # Request timeout in ms

# Logging
LOG_LEVEL=info                        # error, warn, info, debug
LOG_FILE=./logs/app.log              # Log file path

# Email Configuration (if notifications enabled)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

#### Frontend Environment Variables (.env)

```bash
# API Configuration
VITE_API_BASE_URL=https://api.yourdomain.com/api  # Backend API URL
VITE_API_TIMEOUT=10000                # API request timeout

# Application Configuration
VITE_APP_NAME=Patient Management System
VITE_APP_VERSION=1.0.0
VITE_APP_DESCRIPTION=Healthcare Management Platform

# Feature Flags
VITE_ENABLE_ANALYTICS=true            # Enable analytics tracking
VITE_ENABLE_NOTIFICATIONS=true        # Enable push notifications
VITE_ENABLE_DARK_MODE=true           # Enable dark mode toggle

# External Services
VITE_GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX # Google Analytics ID
VITE_SENTRY_DSN=https://...          # Error tracking
```

### Database Migration for Production

```bash
# 1. Backup existing database (if applicable)
pg_dump $DATABASE_URL > backup.sql

# 2. Run migrations
cd backend
npx prisma db push

# 3. Seed initial data (if needed)
npx prisma db seed

# 4. Verify migration
npx prisma studio  # Check data integrity
```

### Health Checks and Monitoring

```bash
# Backend health check endpoint
curl https://api.yourdomain.com/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "database": "connected",
  "memory": "45.2MB",
  "uptime": "2h 15m"
}
```

### Performance Optimization

#### Backend Optimizations
- **Compression**: Gzip compression enabled
- **Caching**: Redis caching for frequent queries
- **Database**: Connection pooling and query optimization
- **Rate Limiting**: API rate limiting to prevent abuse

#### Frontend Optimizations
- **Code Splitting**: Lazy loading of routes and components
- **Asset Optimization**: Image compression and CDN usage
- **Bundle Analysis**: Webpack bundle analyzer for size optimization
- **Service Worker**: Offline functionality and caching

### Security Considerations

```bash
# Security headers (automatically configured)
- Content-Security-Policy
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security

# Additional security measures
- HTTPS enforcement
- JWT token rotation
- Input validation and sanitization
- SQL injection prevention (Prisma ORM)
- XSS protection
```

**Complete Deployment Guide**: See [docs/DEPLOYMENT_AND_CICD.md](docs/DEPLOYMENT_AND_CICD.md)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on:

- Code standards and style guide
- Development workflow
- Pull request process
- Testing requirements
- Documentation standards

### Quick Contribution Steps
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes and add tests
4. Run tests: `npm test`
5. Commit changes: `git commit -m "feat: add your feature"`
6. Push to branch: `git push origin feature/your-feature-name`
7. Create a Pull Request

## 🔧 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill process on port 5000 (backend)
lsof -ti:5000 | xargs kill -9

# Kill process on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9

# Alternative: Find and kill process manually
lsof -i :5000  # Find process using port 5000
kill -9 <PID>  # Kill the process
```

#### Database Issues
```bash
# Reset database
cd backend
npx prisma db push --force-reset

# Regenerate Prisma client
npx prisma generate

# View database in GUI
npx prisma studio

# Check database connection
node -e "const prisma = require('./prismaClient'); prisma.\$connect().then(() => console.log('Connected')).catch(console.error)"
```

#### Dependencies Issues
```bash
# Clear and reinstall (backend)
cd backend
rm -rf node_modules package-lock.json
npm install

# Clear and reinstall (frontend)
cd frontend
rm -rf node_modules package-lock.json
npm install

# Clear npm cache
npm cache clean --force
```

#### Environment Variables Not Loading
- Ensure `.env` files are in the correct directories (`backend/.env` and `frontend/.env`)
- Restart the development servers after changing environment variables
- Check that variable names are correct (frontend variables must start with `VITE_`)
- Verify no extra spaces or quotes around values

#### Frontend Not Accessible Externally (Gitpod/Codespaces)
```bash
# Start frontend with host binding
cd frontend
npm run dev -- --host 0.0.0.0

# Or set in vite.config.js
server: {
  host: '0.0.0.0',
  port: 5173
}
```

#### CORS Issues
- Ensure `CORS_ORIGIN` in backend `.env` matches frontend URL
- For development: `CORS_ORIGIN=http://localhost:5173`
- For Gitpod: `CORS_ORIGIN=*` (development only)

### Quick Commands Reference

#### Development Workflow
```bash
# Start everything (run in separate terminals)
cd backend && npm run dev     # Terminal 1
cd frontend && npm run dev    # Terminal 2

# Run tests
cd backend && npm test

# Reset everything
cd backend && npx prisma db push --force-reset
cd backend && rm -rf node_modules && npm install
cd frontend && rm -rf node_modules && npm install
```

#### Database Operations
```bash
cd backend

# View database
npx prisma studio

# Reset database
npx prisma db push --force-reset

# Generate client after schema changes
npx prisma generate

# Apply schema changes
npx prisma db push
```

#### Testing Commands
```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run specific test file
npx jest tests/routes/patientRoutes.test.js
```

**Complete Troubleshooting Guide**: See [docs/TROUBLESHOOTING_FAQ.md](docs/TROUBLESHOOTING_FAQ.md)

## 📖 Documentation

### For Developers
- **[Developer Onboarding](DEVELOPER_ONBOARDING.md)** - Complete guide for new developers
- **[Development Setup](docs/DEVELOPMENT_SETUP.md)** - Detailed environment setup
- **[Architecture Guide](docs/ARCHITECTURE.md)** - System design and patterns
- **[API Documentation](docs/API_DOCUMENTATION.md)** - Complete API reference
- **[Testing Guide](docs/TESTING_AND_DEBUGGING.md)** - Testing strategies and debugging

### For DevOps
- **[Deployment Guide](docs/DEPLOYMENT_AND_CICD.md)** - Production deployment
- **[Troubleshooting FAQ](docs/TROUBLESHOOTING_FAQ.md)** - Common issues and solutions

### For Contributors
- **[Contributing Guidelines](CONTRIBUTING.md)** - Code standards and process
- **[Changelog](CHANGELOG.md)** - Project changes and updates

## 📞 Support

### Getting Help
1. **Check Documentation**: Start with the relevant guide above
2. **Search Issues**: Look for similar problems in GitHub issues
3. **Create Issue**: If you can't find a solution, create a new issue
4. **Community**: Join our development discussions

### Reporting Issues
When reporting bugs, please include:
- Operating system and version
- Node.js and npm versions
- Steps to reproduce the issue
- Expected vs actual behavior
- Error messages and logs
- Screenshots (if applicable)

### Feature Requests
We welcome feature requests! Please:
- Check existing issues first
- Describe the problem you're trying to solve
- Explain your proposed solution
- Consider the impact on existing functionality

## 📊 Project Status

| Aspect | Status | Details |
|--------|--------|---------|
| **Development** | ✅ Active | Regular updates and improvements |
| **Testing** | ✅ >90% Coverage | Comprehensive test suite |
| **Documentation** | ✅ Complete | 15,000+ words of documentation |
| **Production Ready** | ✅ Yes | Fully deployable system |
| **Security** | ✅ Secure | JWT auth, input validation, CORS |
| **Performance** | ✅ Optimized | Fast API responses, efficient queries |

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web technologies and best practices
- Comprehensive testing and documentation
- Security-first approach
- Developer-friendly setup and contribution process

---

**Ready to start developing?** Follow the [Quick Start](#-quick-start) guide above! 🚀

For detailed setup instructions, see [docs/DEVELOPMENT_SETUP.md](docs/DEVELOPMENT_SETUP.md)

*Last updated: September 13, 2025*