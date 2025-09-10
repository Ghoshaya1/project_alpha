# 🧪 Testing and Debugging Guide

Comprehensive guide for testing and debugging the Patient Management System.

## 📋 Table of Contents

1. [Testing Overview](#-testing-overview)
2. [Test Structure](#-test-structure)
3. [Running Tests](#-running-tests)
4. [Writing Tests](#-writing-tests)
5. [Test Coverage](#-test-coverage)
6. [Debugging Guide](#-debugging-guide)
7. [Performance Testing](#-performance-testing)
8. [Integration Testing](#-integration-testing)
9. [Troubleshooting](#-troubleshooting)

## 🎯 Testing Overview

### Testing Philosophy
- **Test-Driven Development (TDD)**: Write tests before implementation
- **Comprehensive Coverage**: Aim for >90% code coverage
- **Fast Feedback**: Tests should run quickly and provide clear feedback
- **Reliable**: Tests should be deterministic and not flaky
- **Maintainable**: Tests should be easy to read and update

### Testing Pyramid
```
    /\
   /  \     E2E Tests (Few)
  /____\    
 /      \   Integration Tests (Some)
/________\  Unit Tests (Many)
```

### Test Types

| Type | Purpose | Tools | Coverage |
|------|---------|-------|----------|
| **Unit Tests** | Test individual functions/components | Jest | ~80% |
| **Integration Tests** | Test API endpoints and workflows | Jest + Supertest | ~15% |
| **E2E Tests** | Test complete user journeys | Cypress (planned) | ~5% |

## 📁 Test Structure

### Backend Test Organization
```
backend/tests/
├── setup.js                    # Global test configuration
├── utils/
│   ├── testHelpers.js          # Test utilities and mock data
│   └── mockPrisma.js           # Database mocking utilities
├── middlewares/
│   └── authMiddleware.test.js  # Middleware tests
├── routes/
│   ├── authRoutes.test.js      # Authentication tests
│   ├── userRoutes.test.js      # User management tests
│   ├── appointmentRoutes.test.js # Appointment tests
│   └── patientRoutes.test.js   # Patient tests
└── integration/
    └── server.test.js          # Server integration tests
```

### Frontend Test Organization (Planned)
```
frontend/src/
├── __tests__/                  # Test files
├── components/
│   └── __tests__/             # Component tests
├── pages/
│   └── __tests__/             # Page tests
└── utils/
    └── __tests__/             # Utility tests
```

## 🚀 Running Tests

### Backend Tests

#### All Tests
```bash
cd backend
npm test
```

#### Watch Mode (Development)
```bash
npm run test:watch
```

#### Coverage Report
```bash
npm run test:coverage
```

#### Specific Test File
```bash
npx jest tests/routes/authRoutes.test.js
```

#### Specific Test Case
```bash
npx jest --testNamePattern="should create a patient"
```

#### CI/CD Mode
```bash
npm run test:ci
```

### Frontend Tests

#### All Tests
```bash
cd frontend
npm test
```

#### Watch Mode
```bash
npm run test:watch
```

#### Coverage
```bash
npm run test:coverage
```

### Test Scripts Reference

| Command | Purpose |
|---------|---------|
| `npm test` | Run all tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:ci` | Run tests for CI/CD (no watch) |
| `npm run test:unit` | Run only unit tests |
| `npm run test:integration` | Run only integration tests |

## ✍️ Writing Tests

### Test File Naming
- Unit tests: `*.test.js`
- Integration tests: `*.integration.test.js`
- E2E tests: `*.e2e.test.js`

### Basic Test Structure

#### Unit Test Example
```javascript
const { generateToken } = require('../utils/testHelpers');
const authMiddleware = require('../middlewares/authMiddleware');

describe('authMiddleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  describe('Token validation', () => {
    it('should return 403 when no token is provided', () => {
      const middleware = authMiddleware();
      
      middleware(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Access denied' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next() when token is valid', () => {
      const token = generateToken({ userId: 'test-id', role: 'doctor' });
      req.headers.authorization = `Bearer ${token}`;
      const middleware = authMiddleware();
      
      middleware(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
    });
  });
});
```

#### Integration Test Example
```javascript
const request = require('supertest');
const express = require('express');
const authRoutes = require('../routes/authRoutes');

// Mock Prisma
jest.mock('../prismaClient', () => ({
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
  },
}));

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Routes Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@test.com',
        password: 'hashedpassword',
        role: 'doctor',
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@test.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
    });
  });
});
```

### Test Utilities

#### Using Test Helpers
```javascript
const {
  generateToken,
  generateTokens,
  mockUsers,
  mockPatients,
  mockRequest,
  mockResponse,
} = require('../utils/testHelpers');

// Generate custom token
const token = generateToken({ userId: 'custom-id', role: 'admin' });

// Use pre-configured tokens
const doctorToken = generateTokens.doctor();
const patientToken = generateTokens.patient();

// Use mock data
const testUser = mockUsers.doctor;
const testPatient = mockPatients.patient1;

// Mock Express objects
const req = mockRequest({ body: { name: 'Test' } });
const res = mockResponse();
```

#### Mocking Prisma
```javascript
// Mock Prisma client
jest.mock('../prismaClient', () => ({
  user: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  patient: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

const prisma = require('../prismaClient');

// In test
beforeEach(() => {
  jest.clearAllMocks();
});

// Mock successful response
prisma.user.findUnique.mockResolvedValue(mockUser);

// Mock error
prisma.user.create.mockRejectedValue(new Error('Database error'));
```

### Test Best Practices

#### 1. **Arrange, Act, Assert (AAA)**
```javascript
it('should create a patient successfully', async () => {
  // Arrange
  const patientData = { name: 'John Doe', age: 30 };
  const mockPatient = { id: '123', ...patientData };
  prisma.patient.create.mockResolvedValue(mockPatient);

  // Act
  const response = await request(app)
    .post('/api/patients')
    .set('Authorization', `Bearer ${doctorToken}`)
    .send(patientData);

  // Assert
  expect(response.status).toBe(201);
  expect(response.body.patient).toEqual(mockPatient);
});
```

#### 2. **Test Edge Cases**
```javascript
describe('Edge cases', () => {
  it('should handle empty request body', async () => {
    const response = await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({});

    expect(response.status).toBe(400);
  });

  it('should handle database connection failure', async () => {
    prisma.patient.create.mockRejectedValue(new Error('Connection failed'));

    const response = await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({ name: 'John', age: 30 });

    expect(response.status).toBe(400);
  });
});
```

#### 3. **Test Async Operations**
```javascript
it('should handle async operations correctly', async () => {
  const promise = new Promise(resolve => 
    setTimeout(() => resolve(mockData), 100)
  );
  
  prisma.user.findUnique.mockReturnValue(promise);

  const response = await request(app)
    .get('/api/users/me')
    .set('Authorization', `Bearer ${token}`);

  expect(response.status).toBe(200);
});
```

## 📊 Test Coverage

### Coverage Goals
- **Lines**: > 90%
- **Functions**: > 90%
- **Branches**: > 85%
- **Statements**: > 90%

### Viewing Coverage
```bash
# Generate coverage report
npm run test:coverage

# Open HTML report
open coverage/lcov-report/index.html
```

### Coverage Configuration
```javascript
// jest.config.js
module.exports = {
  collectCoverageFrom: [
    'routes/**/*.js',
    'middlewares/**/*.js',
    '!**/node_modules/**',
    '!**/tests/**',
  ],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
};
```

### Ignoring Code from Coverage
```javascript
// Ignore specific lines
/* istanbul ignore next */
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info');
}

// Ignore entire function
/* istanbul ignore next */
function debugFunction() {
  // Debug code
}
```

## 🐛 Debugging Guide

### Backend Debugging

#### VS Code Debugging
1. Set breakpoints in your code
2. Use the debug configuration in `.vscode/launch.json`
3. Press F5 to start debugging

#### Debug Configuration
```json
{
  "name": "Debug Backend",
  "type": "node",
  "request": "launch",
  "program": "${workspaceFolder}/backend/server.js",
  "env": {
    "NODE_ENV": "development",
    "JWT_SECRET": "debug-secret"
  },
  "console": "integratedTerminal",
  "restart": true
}
```

#### Console Debugging
```javascript
// Add debug logs
console.log('Debug: User data:', user);
console.error('Error occurred:', error);

// Use debugger statement
function problematicFunction() {
  debugger; // Execution will pause here
  // Your code
}
```

#### Debug Tests
```bash
# Debug specific test
node --inspect-brk node_modules/.bin/jest tests/routes/authRoutes.test.js --runInBand

# Debug with VS Code
# Use "Debug Tests" configuration in launch.json
```

### Database Debugging

#### Prisma Studio
```bash
cd backend
npx prisma studio
```

#### Database Queries
```javascript
// Enable query logging
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Log specific queries
const users = await prisma.user.findMany();
console.log('Query result:', users);
```

#### Reset Database
```bash
# Reset and reseed
npx prisma db push --force-reset
npx prisma db seed
```

### API Debugging

#### Request/Response Logging
```javascript
// Add logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});
```

#### Test API with cURL
```bash
# Test endpoint
curl -X GET http://localhost:5000/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -v  # Verbose output
```

#### Use Postman
- Import API collection
- Set up environment variables
- Use console for debugging

### Frontend Debugging

#### Browser DevTools
- Use React Developer Tools
- Check Network tab for API calls
- Use Console for JavaScript errors
- Use Sources tab for breakpoints

#### Debug React Components
```javascript
// Add debug logs
useEffect(() => {
  console.log('Component mounted with props:', props);
}, []);

// Use React DevTools Profiler
// Add debugger statement
const handleClick = () => {
  debugger;
  // Your code
};
```

### Common Debugging Scenarios

#### Authentication Issues
```javascript
// Check token format
console.log('Token:', localStorage.getItem('token'));

// Verify token payload
const decoded = jwt.decode(token);
console.log('Token payload:', decoded);

// Check token expiration
const isExpired = Date.now() >= decoded.exp * 1000;
console.log('Token expired:', isExpired);
```

#### Database Issues
```javascript
// Check connection
try {
  await prisma.$connect();
  console.log('Database connected');
} catch (error) {
  console.error('Database connection failed:', error);
}

// Verify data
const count = await prisma.user.count();
console.log('Total users:', count);
```

#### API Response Issues
```javascript
// Log full response
axios.interceptors.response.use(
  response => {
    console.log('API Response:', response.data);
    return response;
  },
  error => {
    console.error('API Error:', error.response?.data);
    return Promise.reject(error);
  }
);
```

## ⚡ Performance Testing

### Load Testing with Artillery
```bash
# Install Artillery
npm install -g artillery

# Create test configuration
# artillery.yml
config:
  target: 'http://localhost:5000'
  phases:
    - duration: 60
      arrivalRate: 10

scenarios:
  - name: "API Load Test"
    requests:
      - get:
          url: "/api/users/me"
          headers:
            Authorization: "Bearer {{ token }}"
```

### Memory Leak Detection
```bash
# Run with memory monitoring
node --inspect --max-old-space-size=4096 server.js

# Use clinic.js for profiling
npm install -g clinic
clinic doctor -- node server.js
```

### Database Performance
```javascript
// Monitor query performance
const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
  ],
});

prisma.$on('query', (e) => {
  console.log('Query: ' + e.query);
  console.log('Duration: ' + e.duration + 'ms');
});
```

## 🔗 Integration Testing

### API Integration Tests
```javascript
describe('Patient Management Flow', () => {
  let doctorToken, patientId;

  beforeAll(async () => {
    // Setup test data
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'doctor@test.com', password: 'password' });
    
    doctorToken = loginResponse.body.token;
  });

  it('should complete patient creation flow', async () => {
    // Create patient
    const createResponse = await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({ name: 'Test Patient', age: 30 });

    expect(createResponse.status).toBe(201);
    patientId = createResponse.body.patient.id;

    // Retrieve patient
    const getResponse = await request(app)
      .get(`/api/patients/${patientId}`)
      .set('Authorization', `Bearer ${doctorToken}`);

    expect(getResponse.status).toBe(200);
    expect(getResponse.body.name).toBe('Test Patient');
  });
});
```

### Database Integration Tests
```javascript
describe('Database Integration', () => {
  beforeEach(async () => {
    // Clean database
    await prisma.appointment.deleteMany();
    await prisma.patient.deleteMany();
    await prisma.user.deleteMany();
  });

  it('should maintain referential integrity', async () => {
    // Create doctor
    const doctor = await prisma.user.create({
      data: {
        name: 'Dr. Test',
        email: 'doctor@test.com',
        password: 'hashed',
        role: 'doctor',
      },
    });

    // Create patient
    const patient = await prisma.patient.create({
      data: {
        name: 'Test Patient',
        age: 30,
        doctorId: doctor.id,
      },
    });

    // Verify relationship
    const patientWithDoctor = await prisma.patient.findUnique({
      where: { id: patient.id },
      include: { doctor: true },
    });

    expect(patientWithDoctor.doctor.name).toBe('Dr. Test');
  });
});
```

## 🔧 Troubleshooting

### Common Test Issues

#### Tests Timing Out
```javascript
// Increase timeout
jest.setTimeout(10000);

// Or for specific test
it('should handle slow operation', async () => {
  // Test code
}, 15000); // 15 second timeout
```

#### Mock Issues
```javascript
// Clear mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});

// Reset modules
beforeEach(() => {
  jest.resetModules();
});
```

#### Database Connection Issues
```javascript
// Ensure proper cleanup
afterAll(async () => {
  await prisma.$disconnect();
});
```

#### Environment Variable Issues
```javascript
// Set in test setup
process.env.JWT_SECRET = 'test-secret';
process.env.NODE_ENV = 'test';
```

### Debug Test Failures

#### Verbose Output
```bash
npx jest --verbose --no-coverage
```

#### Run Single Test
```bash
npx jest --testNamePattern="specific test name"
```

#### Debug Mode
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Performance Issues

#### Slow Tests
- Use `--runInBand` for sequential execution
- Mock external dependencies
- Use test databases
- Optimize database queries

#### Memory Issues
- Clear mocks and data between tests
- Disconnect from database after tests
- Use `--forceExit` if needed

## 📚 Testing Resources

### Documentation
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

### Tools
- **Jest**: Testing framework
- **Supertest**: HTTP assertion library
- **Postman**: API testing
- **Artillery**: Load testing
- **Clinic.js**: Performance profiling

### Team Resources
- Test utilities: `backend/tests/utils/`
- Test examples: `backend/tests/routes/`
- CI/CD pipeline: `.github/workflows/`
- Coverage reports: `coverage/` directory

---

**Happy Testing! 🎉**

Remember: Good tests are your safety net for confident development and deployment.

*Last updated: $(date)*