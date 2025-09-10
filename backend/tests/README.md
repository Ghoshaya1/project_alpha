# Backend Test Suite

This directory contains comprehensive unit and integration tests for the Patient Management System backend API.

## Test Structure

```
tests/
├── setup.js                    # Global test configuration
├── utils/
│   ├── testHelpers.js          # Test utilities and mock data
│   └── mockPrisma.js           # Prisma client mocking utilities
├── middlewares/
│   └── authMiddleware.test.js  # Authentication middleware tests
├── routes/
│   ├── authRoutes.test.js      # Authentication routes tests
│   ├── userRoutes.test.js      # User management routes tests
│   ├── appointmentRoutes.test.js # Appointment routes tests
│   └── patientRoutes.test.js   # Patient routes tests (updated)
└── integration/
    └── server.test.js          # Server integration tests
```

## Running Tests

### All Tests
```bash
npm test
```

### Watch Mode (for development)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

### CI/CD Pipeline
```bash
npm run test:ci
```

### Unit Tests Only
```bash
npm run test:unit
```

### Integration Tests Only
```bash
npm run test:integration
```

## Test Coverage

The test suite covers:

### Authentication Middleware (`authMiddleware.test.js`)
- ✅ Token validation (missing, malformed, invalid, expired)
- ✅ Role-based authorization
- ✅ Edge cases and error handling
- ✅ JWT payload verification

### Authentication Routes (`authRoutes.test.js`)
- ✅ User registration (success, duplicate user, validation)
- ✅ User login (success, invalid credentials, missing fields)
- ✅ Password hashing with bcrypt
- ✅ JWT token generation and validation
- ✅ Error handling and edge cases

### User Routes (`userRoutes.test.js`)
- ✅ Get all users (admin only)
- ✅ Get current user info
- ✅ Get doctor's patients
- ✅ Get patient details with access control
- ✅ Role-based authorization
- ✅ Database error handling

### Patient Routes (`patientRoutes.test.js`)
- ✅ Create patient (fixed doctorId bug)
- ✅ Get patient details
- ✅ Delete patient
- ✅ Access control validation
- ✅ Error handling

### Appointment Routes (`appointmentRoutes.test.js`)
- ✅ Create appointments
- ✅ Get all appointments (admin/doctor)
- ✅ Get patient's appointments
- ✅ Update appointment status
- ✅ Role-based access control
- ✅ Date handling and validation

### Server Integration (`server.test.js`)
- ✅ Basic server functionality
- ✅ CORS configuration
- ✅ Route mounting
- ✅ Error handling
- ✅ JSON parsing

## Test Utilities

### `testHelpers.js`
Provides:
- `generateToken(payload)` - Generate JWT tokens for testing
- `generateTokens` - Pre-configured tokens for different roles
- `mockUsers` - Sample user data
- `mockPatients` - Sample patient data
- `mockAppointments` - Sample appointment data
- `mockRequest/mockResponse/mockNext` - Express mock objects

### `mockPrisma.js`
Provides:
- `createMockPrisma()` - Factory for Prisma client mocks
- `resetMockPrisma(mockPrisma)` - Reset all mock functions

## Test Configuration

### `jest.config.js`
- Node.js test environment
- Coverage collection from routes and middlewares
- HTML and LCOV coverage reports
- Setup file configuration

### `setup.js`
- Test environment variables
- JWT secret for testing
- Console mocking to reduce test noise
- Global timeout configuration

## Mock Strategy

All tests use Jest mocks for:
- **Prisma Client**: Mocked to avoid database dependencies
- **External Dependencies**: Swagger, YAML loader
- **Environment Variables**: Controlled test environment

## Best Practices

1. **Isolation**: Each test is independent with fresh mocks
2. **Comprehensive Coverage**: Tests cover success, error, and edge cases
3. **Role-Based Testing**: All authorization scenarios tested
4. **Error Handling**: Database errors and validation failures covered
5. **Real-World Scenarios**: Tests reflect actual API usage patterns

## Bug Fixes Verified

The test suite specifically verifies the fix for:
- **Patient Creation Bug**: Ensures `req.user.userId` is used instead of `req.user.id`
- **Authorization Logic**: Validates role-based access control
- **Token Validation**: Confirms JWT handling works correctly

## Coverage Goals

- **Lines**: > 90%
- **Functions**: > 90%
- **Branches**: > 85%
- **Statements**: > 90%

## Running Specific Tests

```bash
# Test specific file
npx jest tests/routes/authRoutes.test.js

# Test specific describe block
npx jest --testNamePattern="Authentication Routes"

# Test specific test case
npx jest --testNamePattern="should create a patient with correct doctorId"

# Run tests with verbose output
npx jest --verbose
```

## Debugging Tests

```bash
# Run tests with debugging
node --inspect-brk node_modules/.bin/jest --runInBand

# Run single test with debugging
node --inspect-brk node_modules/.bin/jest --runInBand tests/routes/patientRoutes.test.js
```

## Continuous Integration

The test suite is designed to run in CI/CD pipelines with:
- No external dependencies
- Deterministic results
- Fast execution
- Clear failure reporting

Use `npm run test:ci` for CI/CD environments.