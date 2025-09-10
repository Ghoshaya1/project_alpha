# 🔧 Troubleshooting and FAQ

Comprehensive troubleshooting guide and frequently asked questions for the Patient Management System.

## 📋 Table of Contents

1. [Quick Troubleshooting](#-quick-troubleshooting)
2. [Development Issues](#-development-issues)
3. [Database Problems](#-database-problems)
4. [Authentication Issues](#-authentication-issues)
5. [API and Network Issues](#-api-and-network-issues)
6. [Frontend Problems](#-frontend-problems)
7. [Deployment Issues](#-deployment-issues)
8. [Performance Problems](#-performance-problems)
9. [Frequently Asked Questions](#-frequently-asked-questions)
10. [Getting Help](#-getting-help)

## ⚡ Quick Troubleshooting

### First Steps Checklist
When encountering any issue, try these steps first:

1. **Check the logs**
   ```bash
   # Backend logs
   cd backend && npm run dev
   
   # PM2 logs (production)
   pm2 logs patient-mgmt-api
   ```

2. **Verify environment variables**
   ```bash
   # Check if required variables are set
   echo $JWT_SECRET
   echo $DATABASE_URL
   ```

3. **Restart services**
   ```bash
   # Development
   Ctrl+C and restart npm run dev
   
   # Production
   pm2 restart patient-mgmt-api
   ```

4. **Clear cache and reinstall**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

5. **Check system resources**
   ```bash
   # Memory and CPU usage
   top
   
   # Disk space
   df -h
   
   # Port usage
   lsof -i :5000
   ```

## 💻 Development Issues

### Issue: "Cannot start development server"

#### Symptoms
- Server fails to start
- Port already in use error
- Module not found errors

#### Solutions

**Port Already in Use**
```bash
# Find process using port 5000
lsof -ti:5000

# Kill the process
kill -9 $(lsof -ti:5000)

# Or use different port
PORT=5001 npm run dev
```

**Missing Dependencies**
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for peer dependency issues
npm ls
```

**Node Version Issues**
```bash
# Check Node version
node --version  # Should be 18+

# Use nvm to switch versions
nvm use 18
nvm alias default 18
```

### Issue: "Hot reload not working"

#### Symptoms
- Changes not reflected automatically
- Need to manually refresh

#### Solutions
```bash
# Check if nodemon is installed
npm list nodemon

# Install nodemon globally
npm install -g nodemon

# Use polling for file watching (WSL/Docker)
CHOKIDAR_USEPOLLING=true npm run dev
```

### Issue: "ESLint/Prettier conflicts"

#### Symptoms
- Formatting keeps changing
- Linting errors on save

#### Solutions
```bash
# Fix ESLint issues
npm run lint:fix

# Check Prettier configuration
npx prettier --check .

# Disable conflicting rules
# Add to .eslintrc.js:
{
  "extends": ["prettier"],
  "rules": {
    "prettier/prettier": "error"
  }
}
```

## 🗄️ Database Problems

### Issue: "Database connection failed"

#### Symptoms
- `PrismaClientInitializationError`
- Connection timeout errors
- Authentication failed errors

#### Solutions

**Check Database URL**
```bash
# Verify DATABASE_URL format
echo $DATABASE_URL
# Should be: postgresql://user:password@host:port/database
# Or: file:./prisma/database.db (SQLite)
```

**SQLite Issues**
```bash
# Check if database file exists
ls -la backend/prisma/database.db

# Recreate database
cd backend
npx prisma db push --force-reset
```

**PostgreSQL Issues**
```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1;"

# Check if database exists
psql -h host -U user -l

# Create database if missing
createdb -h host -U user database_name
```

### Issue: "Migration failed"

#### Symptoms
- Migration errors during deployment
- Schema drift warnings
- Foreign key constraint errors

#### Solutions

**Reset Development Database**
```bash
cd backend
npx prisma migrate reset
npx prisma db push
```

**Fix Migration Issues**
```bash
# Check migration status
npx prisma migrate status

# Resolve failed migration
npx prisma migrate resolve --rolled-back migration_name

# Apply pending migrations
npx prisma migrate deploy
```

**Schema Drift**
```bash
# Generate new migration
npx prisma migrate dev --name fix_schema_drift

# Push schema changes without migration
npx prisma db push
```

### Issue: "Prisma Client out of sync"

#### Symptoms
- Type errors in IDE
- Runtime errors about missing fields
- Generated client doesn't match schema

#### Solutions
```bash
# Regenerate Prisma client
npx prisma generate

# Clear Prisma cache
rm -rf node_modules/.prisma
npm install

# Restart TypeScript server (VS Code)
Ctrl+Shift+P -> "TypeScript: Restart TS Server"
```

## 🔐 Authentication Issues

### Issue: "JWT token invalid"

#### Symptoms
- 401 Unauthorized errors
- "Invalid token" messages
- Users logged out unexpectedly

#### Solutions

**Check JWT Secret**
```bash
# Verify JWT_SECRET is set
echo $JWT_SECRET

# Ensure same secret across environments
# Different secrets will invalidate tokens
```

**Token Expiration**
```javascript
// Check token expiration
const jwt = require('jsonwebtoken');
const token = 'your-token-here';
const decoded = jwt.decode(token);
console.log('Expires:', new Date(decoded.exp * 1000));
```

**Token Format Issues**
```javascript
// Correct format
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// Common mistakes
Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  // Missing "Bearer "
Authorization: Bearer: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  // Extra colon
```

### Issue: "Password authentication failed"

#### Symptoms
- Login fails with correct credentials
- "Invalid password" errors
- Bcrypt comparison errors

#### Solutions

**Check Password Hashing**
```javascript
// Test password hashing
const bcrypt = require('bcryptjs');
const password = 'test123';
const hash = await bcrypt.hash(password, 10);
const isValid = await bcrypt.compare(password, hash);
console.log('Password valid:', isValid);
```

**Database Password Issues**
```bash
# Check stored password hash
npx prisma studio
# Look at user table, password field should be hashed
```

**Salt Rounds Configuration**
```javascript
// Ensure consistent salt rounds
const saltRounds = 10; // Should be same everywhere
const hashedPassword = await bcrypt.hash(password, saltRounds);
```

### Issue: "Role-based access not working"

#### Symptoms
- Users can access unauthorized routes
- 403 Forbidden errors for valid users
- Role checks failing

#### Solutions

**Check Token Payload**
```javascript
// Verify role in token
const decoded = jwt.decode(token);
console.log('User role:', decoded.role);
```

**Middleware Configuration**
```javascript
// Correct middleware usage
app.use('/api/admin', authMiddleware(['admin']));
app.use('/api/doctors', authMiddleware(['admin', 'doctor']));
app.use('/api/patients', authMiddleware(['admin', 'doctor', 'patient']));
```

## 🌐 API and Network Issues

### Issue: "CORS errors"

#### Symptoms
- "Access-Control-Allow-Origin" errors
- Preflight request failures
- Cross-origin request blocked

#### Solutions

**Backend CORS Configuration**
```javascript
// Correct CORS setup
const cors = require('cors');

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

**Environment-Specific Origins**
```bash
# Development
CORS_ORIGIN=http://localhost:5173

# Production
CORS_ORIGIN=https://patient-mgmt.com,https://www.patient-mgmt.com
```

### Issue: "API requests failing"

#### Symptoms
- Network errors
- Timeout errors
- 500 Internal Server Error

#### Solutions

**Check API Base URL**
```javascript
// Frontend configuration
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Verify in browser network tab
console.log('API URL:', API_BASE_URL);
```

**Request/Response Logging**
```javascript
// Add request interceptor
axios.interceptors.request.use(request => {
  console.log('Starting Request:', request.url);
  return request;
});

axios.interceptors.response.use(
  response => {
    console.log('Response:', response.status);
    return response;
  },
  error => {
    console.error('API Error:', error.response?.data);
    return Promise.reject(error);
  }
);
```

### Issue: "Rate limiting triggered"

#### Symptoms
- 429 Too Many Requests errors
- Temporary API blocks
- Rate limit headers in response

#### Solutions

**Check Rate Limit Configuration**
```javascript
// Adjust rate limiting
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
});
```

**Bypass for Development**
```javascript
// Disable rate limiting in development
if (process.env.NODE_ENV !== 'production') {
  app.use('/api', limiter);
}
```

## 🎨 Frontend Problems

### Issue: "React app not loading"

#### Symptoms
- Blank white screen
- JavaScript errors in console
- Build failures

#### Solutions

**Check Console Errors**
```bash
# Open browser DevTools (F12)
# Look for JavaScript errors in Console tab
# Check Network tab for failed requests
```

**Build Issues**
```bash
# Clear build cache
rm -rf dist/ .vite/
npm run build

# Check for TypeScript errors
npx tsc --noEmit
```

**Dependency Issues**
```bash
# Check for peer dependency warnings
npm ls

# Update dependencies
npm update

# Clear npm cache
npm cache clean --force
```

### Issue: "Routing not working"

#### Symptoms
- 404 errors on page refresh
- Navigation not working
- Routes not matching

#### Solutions

**Server Configuration**
```nginx
# Nginx configuration for SPA
location / {
    try_files $uri $uri/ /index.html;
}
```

**React Router Configuration**
```javascript
// Ensure BrowserRouter is used correctly
import { BrowserRouter as Router } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}
```

### Issue: "Material-UI styling issues"

#### Symptoms
- Components not styled correctly
- Theme not applied
- CSS conflicts

#### Solutions

**Theme Provider**
```javascript
// Ensure ThemeProvider wraps app
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme();

function App() {
  return (
    <ThemeProvider theme={theme}>
      <YourApp />
    </ThemeProvider>
  );
}
```

**CSS Baseline**
```javascript
// Add CssBaseline for consistent styling
import { CssBaseline } from '@mui/material';

function App() {
  return (
    <>
      <CssBaseline />
      <YourApp />
    </>
  );
}
```

## 🚀 Deployment Issues

### Issue: "Production build fails"

#### Symptoms
- Build process errors
- Out of memory errors
- Missing dependencies

#### Solutions

**Memory Issues**
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Use production build
NODE_ENV=production npm run build
```

**Missing Dependencies**
```bash
# Install production dependencies
npm ci --production

# Check for missing peer dependencies
npm ls --production
```

### Issue: "Environment variables not working"

#### Symptoms
- Undefined environment variables
- Configuration not loading
- Different behavior between environments

#### Solutions

**Frontend Environment Variables**
```bash
# Must be prefixed with VITE_
VITE_API_BASE_URL=https://api.patient-mgmt.com/api

# Check in browser
console.log(import.meta.env.VITE_API_BASE_URL);
```

**Backend Environment Variables**
```bash
# Load from .env file
require('dotenv').config();

# Check if loaded
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
```

### Issue: "SSL/HTTPS problems"

#### Symptoms
- Certificate errors
- Mixed content warnings
- HTTPS redirect loops

#### Solutions

**Certificate Issues**
```bash
# Check certificate validity
openssl x509 -in certificate.crt -text -noout

# Test SSL configuration
curl -I https://patient-mgmt.com
```

**Mixed Content**
```javascript
// Ensure all API calls use HTTPS in production
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.patient-mgmt.com/api'
  : 'http://localhost:5000/api';
```

## ⚡ Performance Problems

### Issue: "Slow API responses"

#### Symptoms
- Long response times
- Timeout errors
- High server load

#### Solutions

**Database Query Optimization**
```javascript
// Add database indexes
// In Prisma schema:
model User {
  id    String @id @default(uuid())
  email String @unique
  
  @@index([email]) // Add index for faster lookups
}

// Optimize queries
const users = await prisma.user.findMany({
  select: { id: true, name: true, email: true }, // Only select needed fields
  where: { role: 'doctor' },
  take: 10, // Limit results
});
```

**Enable Query Logging**
```javascript
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```

**Add Caching**
```javascript
// Simple in-memory cache
const cache = new Map();

app.get('/api/users', async (req, res) => {
  const cacheKey = 'users';
  
  if (cache.has(cacheKey)) {
    return res.json(cache.get(cacheKey));
  }
  
  const users = await prisma.user.findMany();
  cache.set(cacheKey, users);
  
  res.json(users);
});
```

### Issue: "High memory usage"

#### Symptoms
- Server crashes
- Out of memory errors
- Slow performance

#### Solutions

**Monitor Memory Usage**
```javascript
// Add memory monitoring
setInterval(() => {
  const memUsage = process.memoryUsage();
  console.log('Memory usage:', {
    rss: Math.round(memUsage.rss / 1024 / 1024) + 'MB',
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB',
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
  });
}, 30000);
```

**Fix Memory Leaks**
```javascript
// Properly close database connections
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

// Clear intervals and timeouts
const interval = setInterval(() => {}, 1000);
clearInterval(interval);
```

## ❓ Frequently Asked Questions

### General Questions

**Q: What technologies does the system use?**
A: Backend: Node.js, Express, Prisma, SQLite/PostgreSQL. Frontend: React 19, Material-UI, Vite.

**Q: How do I reset my development environment?**
A: 
```bash
# Reset database
cd backend && npx prisma migrate reset

# Clear dependencies
rm -rf node_modules package-lock.json
npm install

# Restart servers
npm run dev
```

**Q: Can I use a different database?**
A: Yes, Prisma supports PostgreSQL, MySQL, SQLite, SQL Server, and MongoDB. Update the `DATABASE_URL` and provider in `schema.prisma`.

### Development Questions

**Q: How do I add a new API endpoint?**
A: 
1. Add route in appropriate file (`routes/`)
2. Add authentication middleware if needed
3. Update Swagger documentation
4. Write tests
5. Update frontend API calls

**Q: How do I add a new user role?**
A: 
1. Update Prisma schema
2. Run migration
3. Update authentication middleware
4. Add role-specific routes
5. Update frontend role checks

**Q: How do I debug API requests?**
A: Use browser DevTools Network tab, add console.log statements, or use tools like Postman.

### Deployment Questions

**Q: How do I deploy to production?**
A: Follow the deployment guide in `DEPLOYMENT_AND_CICD.md`. Ensure environment variables are set and database is migrated.

**Q: How do I rollback a deployment?**
A: Use the rollback script or manually checkout previous version and restart services.

**Q: How do I monitor the application?**
A: Use PM2 for process monitoring, check logs, set up health checks, and use external monitoring services.

### Security Questions

**Q: How are passwords stored?**
A: Passwords are hashed using bcrypt with 10 salt rounds before storing in the database.

**Q: How long do JWT tokens last?**
A: Default is 24 hours. Configure with `JWT_EXPIRES_IN` environment variable.

**Q: Is the API secure?**
A: Yes, it uses JWT authentication, role-based authorization, input validation, and follows security best practices.

### Performance Questions

**Q: How many users can the system handle?**
A: Depends on server resources and database. Current architecture can handle hundreds of concurrent users with proper scaling.

**Q: How do I improve performance?**
A: Add database indexes, implement caching, optimize queries, use CDN for static files, and scale horizontally.

**Q: Why are API responses slow?**
A: Check database queries, add indexes, implement caching, and monitor server resources.

## 🆘 Getting Help

### Self-Help Resources

1. **Check Documentation**
   - [Architecture Guide](./ARCHITECTURE.md)
   - [API Documentation](./API_DOCUMENTATION.md)
   - [Testing Guide](./TESTING_AND_DEBUGGING.md)

2. **Search Issues**
   - GitHub repository issues
   - Stack Overflow
   - Prisma documentation
   - React documentation

3. **Debug Tools**
   - Browser DevTools
   - VS Code debugger
   - Postman for API testing
   - Prisma Studio for database

### Team Support

1. **Slack Channels**
   - `#patient-mgmt-dev` - Development questions
   - `#patient-mgmt-support` - Production issues
   - `#general` - General discussions

2. **Issue Escalation**
   - Create GitHub issue with detailed description
   - Include error messages and steps to reproduce
   - Tag appropriate team members

3. **Emergency Contacts**
   - **Tech Lead**: @tech-lead (Slack)
   - **DevOps**: @devops-team (Slack)
   - **On-call**: Check team calendar

### Creating Good Bug Reports

Include the following information:

1. **Environment**: Development/Staging/Production
2. **Steps to reproduce**: Detailed steps
3. **Expected behavior**: What should happen
4. **Actual behavior**: What actually happens
5. **Error messages**: Full error text
6. **Screenshots**: If applicable
7. **Browser/OS**: Version information
8. **Additional context**: Any other relevant information

### Example Bug Report Template

```markdown
## Bug Report

**Environment**: Development
**Browser**: Chrome 91.0.4472.124
**OS**: macOS 12.0

**Steps to Reproduce**:
1. Login as doctor
2. Navigate to patients page
3. Click "Add Patient" button
4. Fill form and submit

**Expected Behavior**: 
Patient should be created and appear in list

**Actual Behavior**: 
500 error returned, patient not created

**Error Message**:
```
TypeError: Cannot read property 'userId' of undefined
    at /backend/routes/patientRoutes.js:17:25
```

**Additional Context**:
This started happening after the recent authentication changes.
```

---

**Still Need Help?** 

Don't hesitate to reach out to the team. We're here to help you succeed! 🤝

*Last updated: $(date)*