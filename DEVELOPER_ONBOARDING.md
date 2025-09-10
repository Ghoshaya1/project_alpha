# 👋 Developer Onboarding Guide

Welcome to the **Patient Management System**! This guide will help you get up and running quickly as a new developer on the team.

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Quick Start](#-quick-start)
3. [Development Environment](#-development-environment)
4. [Project Architecture](#-project-architecture)
5. [API Documentation](#-api-documentation)
6. [Testing Guide](#-testing-guide)
7. [Deployment](#-deployment)
8. [Code Standards](#-code-standards)
9. [Troubleshooting](#-troubleshooting)
10. [Resources](#-resources)

## 🎯 Project Overview

The Patient Management System is a full-stack web application designed for healthcare providers to manage patients, appointments, and medical records efficiently.

### Key Features
- **User Authentication**: Role-based access (Admin, Doctor, Patient)
- **Patient Management**: CRUD operations for patient records
- **Appointment Scheduling**: Book and manage appointments
- **Medical Records**: Store and retrieve patient medical history
- **Insurance Integration**: Handle insurance details and claims

### Tech Stack
- **Backend**: Node.js, Express.js, Prisma ORM
- **Database**: SQLite (development), PostgreSQL (production)
- **Frontend**: React 19, Material-UI, Vite
- **Authentication**: JWT tokens with bcrypt
- **Testing**: Jest, Supertest
- **Documentation**: Swagger/OpenAPI

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git
- VS Code (recommended)

### 1. Clone and Setup
```bash
# Clone the repository
git clone <repository-url>
cd project_alpha

# Install dependencies
npm install

# Setup backend
cd backend
npm install

# Setup frontend  
cd ../frontend
npm install
```

### 2. Environment Configuration
```bash
# Backend environment (.env)
cd backend
cp .env.example .env

# Configure your environment variables:
JWT_SECRET=your-super-secret-jwt-key
DATABASE_URL="file:./prisma/database.db"
PORT=5000
```

### 3. Database Setup
```bash
cd backend
npx prisma generate
npx prisma db push
npx prisma db seed  # If seed file exists
```

### 4. Start Development Servers
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

### 5. Verify Setup
- Backend: http://localhost:5000
- Frontend: http://localhost:5173
- API Docs: http://localhost:5000/api-docs

## 🏗️ Development Environment

### Recommended VS Code Extensions
```json
{
  "recommendations": [
    "ms-vscode.vscode-json",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "Prisma.prisma",
    "humao.rest-client"
  ]
}
```

### Git Hooks (Husky)
Pre-commit hooks are configured to:
- Run ESLint
- Format code with Prettier
- Run tests
- Validate commit messages

### Development Workflow
1. Create feature branch: `git checkout -b feature/your-feature-name`
2. Make changes and commit: `git commit -m "feat: add new feature"`
3. Run tests: `npm test`
4. Push and create PR: `git push origin feature/your-feature-name`

## 📁 Project Structure

```
project_alpha/
├── backend/                 # Node.js/Express API
│   ├── routes/             # API route handlers
│   ├── middlewares/        # Custom middleware
│   ├── prisma/            # Database schema & migrations
│   ├── tests/             # Test suites
│   └── server.js          # Entry point
├── frontend/               # React application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   └── styles/        # CSS/styling
│   └── public/            # Static assets
├── .devcontainer/         # Development container config
└── docs/                  # Additional documentation
```

## 🔐 Authentication Flow

### User Roles
- **Admin**: Full system access, user management
- **Doctor**: Patient management, appointments
- **Patient**: View own records, book appointments

### JWT Token Structure
```javascript
{
  "userId": "uuid",
  "role": "doctor|patient|admin",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Protected Routes
All API routes except `/api/auth/*` require authentication via Bearer token.

## 🧪 Testing

### Running Tests
```bash
# Backend tests
cd backend
npm test                    # All tests
npm run test:watch         # Watch mode
npm run test:coverage      # With coverage
npm run test:unit          # Unit tests only

# Frontend tests
cd frontend
npm test
```

### Test Structure
- **Unit Tests**: Individual functions/components
- **Integration Tests**: API endpoints
- **E2E Tests**: Full user workflows (planned)

### Writing Tests
- Follow existing patterns in `/backend/tests/`
- Use provided test utilities and mocks
- Aim for >90% coverage on new code

## 🚀 Deployment

### Development
- Automatic deployment on push to `develop` branch
- Environment: https://dev-patient-mgmt.example.com

### Staging
- Deployment on push to `staging` branch
- Environment: https://staging-patient-mgmt.example.com

### Production
- Manual deployment from `main` branch
- Environment: https://patient-mgmt.example.com

### Environment Variables
Ensure all environments have:
- `JWT_SECRET`
- `DATABASE_URL`
- `CORS_ORIGIN`
- `NODE_ENV`

## 📝 Code Standards

### JavaScript/TypeScript
- Use ES6+ features
- Prefer `const` over `let`
- Use async/await over Promises
- Follow existing naming conventions

### React
- Functional components with hooks
- Use Material-UI components
- Keep components small and focused
- Use proper prop types

### API Design
- RESTful endpoints
- Consistent error responses
- Proper HTTP status codes
- Comprehensive input validation

### Database
- Use Prisma for all database operations
- Write migrations for schema changes
- Follow naming conventions (camelCase)

## 🐛 Common Issues & Solutions

### Database Issues
```bash
# Reset database
npx prisma db push --force-reset

# Regenerate client
npx prisma generate
```

### Port Conflicts
```bash
# Kill process on port
lsof -ti:5000 | xargs kill -9
```

### JWT Issues
- Ensure `JWT_SECRET` is set in environment
- Check token expiration (24h default)
- Verify token format: `Bearer <token>`

## 📚 Learning Resources

### Project-Specific
- [API Documentation](./docs/API.md)
- [Database Schema](./docs/DATABASE.md)
- [Frontend Components](./docs/COMPONENTS.md)
- [Testing Guide](./backend/tests/README.md)

### External Resources
- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [React Documentation](https://react.dev)
- [Material-UI Components](https://mui.com/components/)

## 🤝 Getting Help

### Team Communication
- **Slack**: #patient-mgmt-dev
- **Daily Standups**: 9:00 AM EST
- **Code Reviews**: Required for all PRs

### Escalation Path
1. Check this documentation
2. Search existing issues/PRs
3. Ask in team Slack channel
4. Create GitHub issue
5. Reach out to tech lead

### Key Contacts
- **Tech Lead**: @tech-lead
- **DevOps**: @devops-team
- **Product Owner**: @product-owner

## 🎯 First Week Goals

### Day 1-2: Environment Setup
- [ ] Complete development environment setup
- [ ] Run application locally
- [ ] Explore codebase structure
- [ ] Read through API documentation

### Day 3-4: Small Contributions
- [ ] Fix a "good first issue"
- [ ] Write/update tests
- [ ] Review existing PRs
- [ ] Understand deployment process

### Day 5: Team Integration
- [ ] Attend team meetings
- [ ] Present your first contribution
- [ ] Discuss upcoming features
- [ ] Set up development workflow

## 📋 Checklist for New Developers

- [ ] Repository cloned and dependencies installed
- [ ] Development environment running locally
- [ ] Database setup and seeded
- [ ] Tests passing
- [ ] VS Code extensions installed
- [ ] Git hooks configured
- [ ] Environment variables configured
- [ ] API documentation reviewed
- [ ] First PR created and merged
- [ ] Team introductions completed

---

**Welcome to the team! 🎉**

If you have any questions or suggestions for improving this onboarding guide, please don't hesitate to reach out or submit a PR.

*Last updated: $(date)*