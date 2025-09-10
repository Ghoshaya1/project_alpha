# 🛠️ Development Environment Setup

This guide provides step-by-step instructions for setting up your development environment for the Patient Management System.

## 📋 Table of Contents

1. [Prerequisites](#-prerequisites)
2. [System Requirements](#-system-requirements)
3. [Installation Steps](#-installation-steps)
4. [Environment Configuration](#-environment-configuration)
5. [Database Setup](#-database-setup)
6. [Development Tools](#-development-tools)
7. [IDE Configuration](#-ide-configuration)
8. [Verification](#-verification)
9. [Troubleshooting](#-troubleshooting)

## 🔧 Prerequisites

### Required Software

| Software | Version | Purpose | Installation |
|----------|---------|---------|--------------|
| **Node.js** | 18.0+ | Runtime environment | [Download](https://nodejs.org/) |
| **npm** | 8.0+ | Package manager | Included with Node.js |
| **Git** | 2.30+ | Version control | [Download](https://git-scm.com/) |
| **VS Code** | Latest | Code editor (recommended) | [Download](https://code.visualstudio.com/) |

### Optional but Recommended

| Software | Purpose | Installation |
|----------|---------|--------------|
| **Docker** | Containerization | [Download](https://docker.com/) |
| **Postman** | API testing | [Download](https://postman.com/) |
| **DB Browser for SQLite** | Database inspection | [Download](https://sqlitebrowser.org/) |

## 💻 System Requirements

### Minimum Requirements
- **OS**: Windows 10, macOS 10.15, or Ubuntu 18.04+
- **RAM**: 8GB
- **Storage**: 2GB free space
- **CPU**: Dual-core processor

### Recommended Requirements
- **OS**: Latest stable versions
- **RAM**: 16GB
- **Storage**: 5GB free space (for dependencies and tools)
- **CPU**: Quad-core processor

## 📦 Installation Steps

### 1. Clone the Repository

```bash
# Using HTTPS
git clone https://github.com/your-org/patient-management-system.git
cd patient-management-system

# Using SSH (if configured)
git clone git@github.com:your-org/patient-management-system.git
cd patient-management-system
```

### 2. Install Dependencies

```bash
# Install root dependencies (if any)
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root directory
cd ..
```

### 3. Verify Installation

```bash
# Check Node.js version
node --version  # Should be 18.0+

# Check npm version
npm --version   # Should be 8.0+

# Check Git version
git --version   # Should be 2.30+
```

## ⚙️ Environment Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cd backend
cp .env.example .env  # If example exists, or create new file
```

Add the following variables to `backend/.env`:

```env
# Application Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
DATABASE_URL="file:./prisma/database.db"

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Logging
LOG_LEVEL=debug

# Optional: External Services
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password
```

### Frontend Environment Variables

Create a `.env` file in the `frontend` directory:

```bash
cd frontend
touch .env
```

Add the following variables to `frontend/.env`:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=Patient Management System

# Development Configuration
VITE_NODE_ENV=development
```

### Environment Variable Security

⚠️ **Important Security Notes:**
- Never commit `.env` files to version control
- Use strong, unique JWT secrets in production
- Rotate secrets regularly
- Use environment-specific configurations

## 🗄️ Database Setup

### 1. Generate Prisma Client

```bash
cd backend
npx prisma generate
```

### 2. Initialize Database

```bash
# Create and migrate database
npx prisma db push

# Alternative: Use migrations (recommended for production)
npx prisma migrate dev --name init
```

### 3. Seed Database (Optional)

If seed data is available:

```bash
npx prisma db seed
```

### 4. Verify Database

```bash
# Open Prisma Studio (database GUI)
npx prisma studio
```

This will open a web interface at `http://localhost:5555` to inspect your database.

## 🛠️ Development Tools

### Package Scripts

#### Backend Scripts
```bash
cd backend

# Development server with hot reload
npm run dev

# Production server
npm start

# Run tests
npm test
npm run test:watch    # Watch mode
npm run test:coverage # With coverage

# Database operations
npm run db:reset      # Reset database
npm run db:seed       # Seed database
npm run db:studio     # Open Prisma Studio
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

### Git Hooks (Husky)

Pre-commit hooks are automatically configured to:
- Run ESLint and fix issues
- Format code with Prettier
- Run tests
- Validate commit messages

To manually install hooks:
```bash
npm run prepare
```

## 🎨 IDE Configuration

### VS Code Setup

#### Recommended Extensions

Create `.vscode/extensions.json`:
```json
{
  "recommendations": [
    "ms-vscode.vscode-json",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "Prisma.prisma",
    "humao.rest-client",
    "ms-vscode.vscode-json",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

#### Workspace Settings

Create `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "javascript": "javascriptreact"
  },
  "files.associations": {
    "*.css": "css"
  }
}
```

#### Debug Configuration

Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Backend",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/backend/server.js",
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal",
      "restart": true,
      "runtimeExecutable": "nodemon"
    },
    {
      "name": "Debug Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/backend/node_modules/.bin/jest",
      "args": ["--runInBand"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

### Code Formatting

#### Prettier Configuration

Create `.prettierrc`:
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

#### ESLint Configuration

Frontend ESLint is already configured in `frontend/eslint.config.js`.

For backend, create `backend/.eslintrc.js`:
```javascript
module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    'no-unused-vars': 'warn',
    'no-console': 'off',
    'prefer-const': 'error',
  },
};
```

## ✅ Verification

### 1. Start Development Servers

#### Terminal 1: Backend
```bash
cd backend
npm run dev
```

Expected output:
```
🚀 Server running on http://localhost:5000
Database connected successfully
```

#### Terminal 2: Frontend
```bash
cd frontend
npm run dev
```

Expected output:
```
  VITE v6.2.0  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 2. Test API Endpoints

```bash
# Test health endpoint
curl http://localhost:5000/

# Expected response: "Patient Management System API is running..."
```

### 3. Test Frontend

1. Open http://localhost:5173
2. You should see the login page
3. Navigation should work without errors

### 4. Test Database Connection

```bash
cd backend
npx prisma studio
```

Should open database interface at http://localhost:5555

### 5. Run Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests (if available)
cd frontend
npm test
```

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port 5000
lsof -ti:5000

# Kill the process
kill -9 $(lsof -ti:5000)

# Or use different port
PORT=5001 npm run dev
```

#### Database Issues
```bash
# Reset database
cd backend
npx prisma db push --force-reset

# Regenerate Prisma client
npx prisma generate
```

#### Node Modules Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Permission Issues (macOS/Linux)
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

### Environment-Specific Issues

#### Windows
- Use Git Bash or PowerShell
- Ensure Windows Subsystem for Linux (WSL) if needed
- Check antivirus software isn't blocking Node.js

#### macOS
- Install Xcode Command Line Tools: `xcode-select --install`
- Use Homebrew for package management
- Check file permissions

#### Linux
- Install build essentials: `sudo apt-get install build-essential`
- Ensure proper Node.js installation
- Check firewall settings

### Getting Help

1. **Check logs**: Look at console output for error messages
2. **Clear cache**: Try clearing npm cache and reinstalling
3. **Check versions**: Ensure all software meets minimum requirements
4. **Search issues**: Look for similar problems in project issues
5. **Ask team**: Reach out in team Slack channel

### Useful Commands

```bash
# Check all versions
node --version && npm --version && git --version

# Clean install everything
rm -rf node_modules package-lock.json && npm install

# Reset development environment
npm run clean && npm install && npm run setup

# Check for outdated packages
npm outdated

# Update packages
npm update
```

## 🚀 Next Steps

After successful setup:

1. **Read the codebase**: Start with `ARCHITECTURE.md`
2. **Run tests**: Ensure everything works
3. **Make a small change**: Try fixing a simple issue
4. **Create a PR**: Follow the contribution guidelines
5. **Join team meetings**: Get integrated with the team

## 📚 Additional Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com/en/guide/)
- [VS Code Tips](https://code.visualstudio.com/docs)

---

**Need help?** Don't hesitate to ask in the team Slack channel or create an issue in the repository.

*Last updated: $(date)*