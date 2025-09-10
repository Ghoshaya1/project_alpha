# 🤝 Contributing Guidelines

Welcome to the Patient Management System! We're excited to have you contribute to this project. This guide will help you understand our development process and coding standards.

## 📋 Table of Contents

1. [Code of Conduct](#-code-of-conduct)
2. [Getting Started](#-getting-started)
3. [Development Workflow](#-development-workflow)
4. [Code Style Guidelines](#-code-style-guidelines)
5. [Commit Message Guidelines](#-commit-message-guidelines)
6. [Pull Request Process](#-pull-request-process)
7. [Testing Requirements](#-testing-requirements)
8. [Documentation Standards](#-documentation-standards)
9. [Issue Guidelines](#-issue-guidelines)
10. [Review Process](#-review-process)

## 📜 Code of Conduct

### Our Pledge
We are committed to making participation in this project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards
**Positive behavior includes:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behavior includes:**
- The use of sexualized language or imagery
- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information without explicit permission
- Other conduct which could reasonably be considered inappropriate in a professional setting

### Enforcement
Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by contacting the project team at [team-email]. All complaints will be reviewed and investigated promptly and fairly.

## 🚀 Getting Started

### Prerequisites
Before contributing, ensure you have:
- [ ] Read the [Developer Onboarding Guide](./DEVELOPER_ONBOARDING.md)
- [ ] Set up your development environment
- [ ] Familiarized yourself with the codebase
- [ ] Joined the team Slack workspace

### First Contribution
1. Look for issues labeled `good first issue` or `help wanted`
2. Comment on the issue to express interest
3. Wait for assignment before starting work
4. Follow the development workflow below

## 🔄 Development Workflow

### 1. Issue Assignment
- Browse open issues in the GitHub repository
- Comment on issues you'd like to work on
- Wait for maintainer assignment before starting
- Ask questions if requirements are unclear

### 2. Branch Creation
```bash
# Create feature branch from main
git checkout main
git pull origin main
git checkout -b feature/issue-number-short-description

# Examples:
git checkout -b feature/123-add-patient-search
git checkout -b bugfix/456-fix-login-validation
git checkout -b docs/789-update-api-documentation
```

### 3. Development Process
```bash
# Make your changes
# Write tests for new functionality
# Ensure all tests pass
npm test

# Run linting and formatting
npm run lint:fix
npm run format

# Commit your changes (see commit guidelines below)
git add .
git commit -m "feat: add patient search functionality"

# Push to your branch
git push origin feature/123-add-patient-search
```

### 4. Pull Request Creation
- Create PR from your feature branch to `main`
- Fill out the PR template completely
- Link to related issues
- Request review from appropriate team members

### Branch Naming Conventions

| Type | Format | Example |
|------|--------|---------|
| **Feature** | `feature/issue-description` | `feature/123-patient-search` |
| **Bug Fix** | `bugfix/issue-description` | `bugfix/456-login-error` |
| **Documentation** | `docs/description` | `docs/update-api-docs` |
| **Refactor** | `refactor/description` | `refactor/auth-middleware` |
| **Performance** | `perf/description` | `perf/optimize-queries` |
| **Test** | `test/description` | `test/add-patient-tests` |

## 🎨 Code Style Guidelines

### JavaScript/Node.js Standards

#### General Principles
- **Consistency**: Follow existing code patterns
- **Readability**: Write self-documenting code
- **Simplicity**: Prefer simple solutions over complex ones
- **Performance**: Consider performance implications
- **Security**: Always validate inputs and handle errors

#### Naming Conventions
```javascript
// Variables and functions: camelCase
const patientData = {};
const getUserById = () => {};

// Constants: UPPER_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3;
const API_BASE_URL = 'https://api.example.com';

// Classes: PascalCase
class PatientService {}
class AuthenticationError extends Error {}

// Files and directories: kebab-case
patient-routes.js
auth-middleware.js
test-helpers.js
```

#### Function Guidelines
```javascript
// Prefer arrow functions for simple operations
const calculateAge = (birthDate) => {
  return new Date().getFullYear() - birthDate.getFullYear();
};

// Use regular functions for methods and complex logic
function validatePatientData(data) {
  if (!data.name || !data.age) {
    throw new Error('Name and age are required');
  }
  
  return {
    isValid: true,
    sanitizedData: {
      name: data.name.trim(),
      age: parseInt(data.age, 10),
    },
  };
}

// Always handle async operations properly
async function createPatient(patientData) {
  try {
    const validatedData = validatePatientData(patientData);
    const patient = await prisma.patient.create({
      data: validatedData.sanitizedData,
    });
    return patient;
  } catch (error) {
    logger.error('Failed to create patient:', error);
    throw new Error('Patient creation failed');
  }
}
```

#### Error Handling
```javascript
// Always handle errors explicitly
try {
  const result = await riskyOperation();
  return result;
} catch (error) {
  logger.error('Operation failed:', error);
  throw new Error('Specific error message for user');
}

// Use custom error classes
class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

// Validate inputs
function processPatientAge(age) {
  if (typeof age !== 'number' || age < 0 || age > 150) {
    throw new ValidationError('Age must be a number between 0 and 150', 'age');
  }
  return age;
}
```

#### API Route Structure
```javascript
// routes/patientRoutes.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const authMiddleware = require('../middlewares/authMiddleware');
const prisma = require('../prismaClient');
const logger = require('../utils/logger');

const router = express.Router();

// GET /api/patients - Get all patients
router.get('/', authMiddleware(['admin', 'doctor']), async (req, res) => {
  try {
    const patients = await prisma.patient.findMany({
      include: { doctor: { select: { id: true, name: true } } },
    });
    
    res.json(patients);
  } catch (error) {
    logger.error('Failed to fetch patients:', error);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

// POST /api/patients - Create patient
router.post(
  '/',
  authMiddleware(['doctor']),
  [
    body('name').trim().isLength({ min: 2, max: 100 }),
    body('age').isInt({ min: 0, max: 150 }),
    body('medicalHistory').optional().trim(),
  ],
  async (req, res) => {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: errors.array() 
        });
      }

      const { name, age, medicalHistory, insuranceDetails } = req.body;
      
      const patient = await prisma.patient.create({
        data: {
          name,
          age,
          medicalHistory,
          insuranceDetails,
          doctorId: req.user.userId,
        },
      });

      res.status(201).json({ 
        message: 'Patient created successfully', 
        patient 
      });
    } catch (error) {
      logger.error('Failed to create patient:', error);
      res.status(500).json({ error: 'Failed to create patient' });
    }
  }
);

module.exports = router;
```

### React/Frontend Standards

#### Component Structure
```javascript
// components/PatientCard.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, Typography, Button } from '@mui/material';

/**
 * PatientCard component displays patient information in a card format
 * @param {Object} patient - Patient data object
 * @param {Function} onEdit - Callback function when edit button is clicked
 * @param {Function} onDelete - Callback function when delete button is clicked
 */
const PatientCard = ({ patient, onEdit, onDelete }) => {
  const handleEdit = () => {
    onEdit(patient.id);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      onDelete(patient.id);
    }
  };

  return (
    <Card sx={{ minWidth: 275, margin: 1 }}>
      <CardContent>
        <Typography variant="h5" component="div">
          {patient.name}
        </Typography>
        <Typography sx={{ mb: 1.5 }} color="text.secondary">
          Age: {patient.age}
        </Typography>
        <Typography variant="body2">
          {patient.medicalHistory || 'No medical history available'}
        </Typography>
        <div style={{ marginTop: '1rem' }}>
          <Button size="small" onClick={handleEdit}>
            Edit
          </Button>
          <Button size="small" color="error" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

PatientCard.propTypes = {
  patient: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    age: PropTypes.number.isRequired,
    medicalHistory: PropTypes.string,
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default PatientCard;
```

#### Hooks and State Management
```javascript
// hooks/usePatients.js
import { useState, useEffect } from 'react';
import axios from 'axios';

const usePatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/patients', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setPatients(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  };

  const createPatient = async (patientData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/patients', patientData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setPatients(prev => [...prev, response.data.patient]);
      return response.data.patient;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to create patient');
    }
  };

  const deletePatient = async (patientId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/patients/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setPatients(prev => prev.filter(p => p.id !== patientId));
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to delete patient');
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  return {
    patients,
    loading,
    error,
    fetchPatients,
    createPatient,
    deletePatient,
  };
};

export default usePatients;
```

### Database/Prisma Standards

#### Schema Design
```prisma
// prisma/schema.prisma
model User {
  id       String @id @default(uuid())
  name     String
  email    String @unique
  password String
  role     Role   @default(PATIENT)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relationships
  doctorPatients      Patient[]     @relation("DoctorToPatients")
  doctorAppointments  Appointment[] @relation("DoctorAppointments")
  patientAppointments Appointment[] @relation("PatientAppointments")
  
  // Indexes for performance
  @@index([email])
  @@index([role])
  @@map("users")
}

model Patient {
  id               String  @id @default(uuid())
  name             String
  age              Int
  medicalHistory   String?
  insuranceDetails String?
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Foreign key relationship
  doctor   User?   @relation("DoctorToPatients", fields: [doctorId], references: [id])
  doctorId String?
  
  @@index([doctorId])
  @@map("patients")
}

enum Role {
  ADMIN
  DOCTOR
  PATIENT
}
```

#### Query Patterns
```javascript
// Good: Specific field selection
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
    role: true,
  },
  where: { role: 'DOCTOR' },
});

// Good: Include related data efficiently
const patientsWithDoctors = await prisma.patient.findMany({
  include: {
    doctor: {
      select: { id: true, name: true },
    },
  },
  take: 20, // Limit results
  skip: offset, // Pagination
});

// Good: Transaction for related operations
const result = await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({
    data: { name, email, password: hashedPassword, role },
  });
  
  if (role === 'PATIENT') {
    await tx.patient.create({
      data: { name, age, userId: user.id },
    });
  }
  
  return user;
});
```

## 📝 Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types
- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to the build process or auxiliary tools

### Examples
```bash
# Feature
git commit -m "feat(auth): add JWT token refresh functionality"

# Bug fix
git commit -m "fix(patients): resolve patient creation validation error"

# Documentation
git commit -m "docs(api): update authentication endpoint documentation"

# Breaking change
git commit -m "feat(api)!: change patient data structure

BREAKING CHANGE: Patient age field is now required and must be a number"
```

### Commit Message Rules
1. Use the imperative mood ("add" not "added" or "adds")
2. Don't capitalize the first letter of the description
3. No period at the end of the description
4. Limit the first line to 72 characters or less
5. Reference issues and pull requests when applicable

## 🔄 Pull Request Process

### PR Template
When creating a pull request, use this template:

```markdown
## Description
Brief description of the changes made.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Related Issues
Closes #123
Related to #456

## Changes Made
- List of specific changes
- Another change
- Third change

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] New tests added for new functionality

## Screenshots (if applicable)
Add screenshots to help explain your changes.

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
```

### PR Requirements
Before submitting a PR, ensure:

1. **Code Quality**
   - [ ] Code follows style guidelines
   - [ ] No linting errors
   - [ ] No console.log statements in production code
   - [ ] Proper error handling implemented

2. **Testing**
   - [ ] All existing tests pass
   - [ ] New tests added for new functionality
   - [ ] Test coverage maintained or improved
   - [ ] Manual testing completed

3. **Documentation**
   - [ ] Code is properly commented
   - [ ] API documentation updated if needed
   - [ ] README updated if needed
   - [ ] Migration guide provided for breaking changes

4. **Security**
   - [ ] No sensitive data exposed
   - [ ] Input validation implemented
   - [ ] Authentication/authorization properly handled
   - [ ] Dependencies are secure and up-to-date

### Review Process
1. **Automated Checks**: CI/CD pipeline runs tests and linting
2. **Peer Review**: At least one team member reviews the code
3. **Maintainer Review**: Project maintainer provides final approval
4. **Merge**: PR is merged after all checks pass and approvals received

## 🧪 Testing Requirements

### Test Coverage Standards
- **Minimum Coverage**: 80% overall
- **New Code**: 90% coverage required
- **Critical Paths**: 100% coverage (authentication, data validation)

### Test Types Required

#### Unit Tests
```javascript
// Example: Testing a utility function
describe('validatePatientData', () => {
  it('should validate correct patient data', () => {
    const validData = { name: 'John Doe', age: 30 };
    const result = validatePatientData(validData);
    
    expect(result.isValid).toBe(true);
    expect(result.sanitizedData.name).toBe('John Doe');
  });

  it('should reject invalid age', () => {
    const invalidData = { name: 'John Doe', age: -5 };
    
    expect(() => validatePatientData(invalidData))
      .toThrow('Age must be between 0 and 150');
  });
});
```

#### Integration Tests
```javascript
// Example: Testing API endpoint
describe('POST /api/patients', () => {
  it('should create patient with valid data', async () => {
    const patientData = {
      name: 'Test Patient',
      age: 25,
      medicalHistory: 'None',
    };

    const response = await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send(patientData);

    expect(response.status).toBe(201);
    expect(response.body.patient.name).toBe('Test Patient');
  });
});
```

#### Frontend Tests
```javascript
// Example: Testing React component
import { render, screen, fireEvent } from '@testing-library/react';
import PatientCard from './PatientCard';

describe('PatientCard', () => {
  const mockPatient = {
    id: '1',
    name: 'John Doe',
    age: 30,
    medicalHistory: 'None',
  };

  it('should display patient information', () => {
    render(
      <PatientCard 
        patient={mockPatient} 
        onEdit={jest.fn()} 
        onDelete={jest.fn()} 
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Age: 30')).toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', () => {
    const mockOnEdit = jest.fn();
    
    render(
      <PatientCard 
        patient={mockPatient} 
        onEdit={mockOnEdit} 
        onDelete={jest.fn()} 
      />
    );

    fireEvent.click(screen.getByText('Edit'));
    expect(mockOnEdit).toHaveBeenCalledWith('1');
  });
});
```

## 📚 Documentation Standards

### Code Documentation

#### JSDoc Comments
```javascript
/**
 * Creates a new patient record in the database
 * @param {Object} patientData - The patient data object
 * @param {string} patientData.name - Patient's full name
 * @param {number} patientData.age - Patient's age in years
 * @param {string} [patientData.medicalHistory] - Optional medical history
 * @param {string} userId - ID of the doctor creating the patient
 * @returns {Promise<Object>} The created patient object
 * @throws {ValidationError} When patient data is invalid
 * @throws {DatabaseError} When database operation fails
 * 
 * @example
 * const patient = await createPatient({
 *   name: 'John Doe',
 *   age: 30,
 *   medicalHistory: 'Diabetes'
 * }, 'doctor-123');
 */
async function createPatient(patientData, userId) {
  // Implementation
}
```

#### README Updates
When adding new features, update relevant README sections:
- Installation instructions
- Configuration options
- Usage examples
- API endpoints
- Environment variables

#### API Documentation
Update Swagger/OpenAPI documentation for API changes:
```yaml
# swagger.yaml
paths:
  /api/patients:
    post:
      summary: Create a new patient
      tags:
        - Patients
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/PatientInput'
      responses:
        '201':
          description: Patient created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PatientResponse'
```

## 🐛 Issue Guidelines

### Creating Issues

#### Bug Reports
Use this template for bug reports:
```markdown
**Bug Description**
A clear and concise description of what the bug is.

**Steps to Reproduce**
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected Behavior**
A clear description of what you expected to happen.

**Actual Behavior**
A clear description of what actually happened.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment**
- OS: [e.g. macOS 12.0]
- Browser: [e.g. Chrome 91]
- Node.js version: [e.g. 18.0.0]
- Environment: [Development/Staging/Production]

**Additional Context**
Add any other context about the problem here.
```

#### Feature Requests
Use this template for feature requests:
```markdown
**Feature Description**
A clear and concise description of what you want to happen.

**Problem Statement**
What problem does this feature solve? Who would benefit from it?

**Proposed Solution**
Describe the solution you'd like to see implemented.

**Alternatives Considered**
Describe any alternative solutions or features you've considered.

**Additional Context**
Add any other context, mockups, or examples about the feature request here.

**Acceptance Criteria**
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3
```

### Issue Labels
We use the following labels to categorize issues:

| Label | Description |
|-------|-------------|
| `bug` | Something isn't working |
| `enhancement` | New feature or request |
| `documentation` | Improvements or additions to documentation |
| `good first issue` | Good for newcomers |
| `help wanted` | Extra attention is needed |
| `priority: high` | High priority issue |
| `priority: medium` | Medium priority issue |
| `priority: low` | Low priority issue |
| `status: in progress` | Currently being worked on |
| `status: blocked` | Blocked by another issue or external factor |

## 👀 Review Process

### Code Review Checklist

#### For Authors
Before requesting review:
- [ ] Self-review completed
- [ ] All tests pass
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] No debugging code left in
- [ ] Commit messages follow conventions

#### For Reviewers
When reviewing code:
- [ ] Code is readable and maintainable
- [ ] Logic is correct and efficient
- [ ] Error handling is appropriate
- [ ] Security considerations addressed
- [ ] Tests are comprehensive
- [ ] Documentation is accurate

### Review Guidelines

#### Providing Feedback
- **Be constructive**: Focus on the code, not the person
- **Be specific**: Point out exact lines and suggest improvements
- **Explain reasoning**: Help others learn by explaining why
- **Ask questions**: If something is unclear, ask for clarification
- **Acknowledge good work**: Highlight well-written code

#### Example Review Comments
```markdown
**Good:**
"Consider using a more descriptive variable name here. `userData` might be clearer than `data`."

**Better:**
"This variable name could be more descriptive. Consider `userData` instead of `data` to make the code more readable."

**Best:**
"This variable name could be more descriptive. Consider `userData` instead of `data` to make the code more readable. This will help future developers understand the data structure being passed around."
```

#### Responding to Feedback
- **Be open**: Consider all feedback objectively
- **Ask for clarification**: If feedback is unclear, ask questions
- **Explain decisions**: If you disagree, explain your reasoning
- **Make changes**: Address feedback promptly
- **Say thanks**: Acknowledge helpful feedback

### Approval Process
1. **Automated checks** must pass (CI/CD, linting, tests)
2. **Peer review** from at least one team member
3. **Maintainer approval** for significant changes
4. **Final merge** by maintainer or senior developer

## 🎉 Recognition

### Contributor Recognition
We recognize contributors through:
- **GitHub contributors page**
- **Monthly team shoutouts**
- **Annual contributor awards**
- **Conference speaking opportunities**
- **Open source portfolio building**

### Becoming a Maintainer
Regular contributors may be invited to become maintainers based on:
- Consistent high-quality contributions
- Helpful code reviews
- Community involvement
- Technical expertise
- Leadership qualities

---

## 🙏 Thank You

Thank you for contributing to the Patient Management System! Your efforts help make healthcare technology better for everyone.

**Questions?** Feel free to reach out to the team in Slack or create an issue for discussion.

*Last updated: $(date)*