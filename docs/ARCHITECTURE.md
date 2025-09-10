# 🏗️ System Architecture

This document provides a comprehensive overview of the Patient Management System architecture, design patterns, and technical decisions.

## 📋 Table of Contents

1. [System Overview](#-system-overview)
2. [Architecture Patterns](#-architecture-patterns)
3. [Backend Architecture](#-backend-architecture)
4. [Frontend Architecture](#-frontend-architecture)
5. [Database Design](#-database-design)
6. [Security Architecture](#-security-architecture)
7. [API Design](#-api-design)
8. [Data Flow](#-data-flow)
9. [Scalability Considerations](#-scalability-considerations)

## 🎯 System Overview

The Patient Management System follows a **3-tier architecture** with clear separation of concerns:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Presentation  │    │    Business     │    │      Data       │
│      Layer      │◄──►│     Logic       │◄──►│     Layer       │
│   (React SPA)   │    │  (Express API)  │    │   (SQLite/PG)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Key Architectural Principles

1. **Separation of Concerns**: Clear boundaries between layers
2. **Single Responsibility**: Each module has one reason to change
3. **Dependency Inversion**: High-level modules don't depend on low-level modules
4. **RESTful Design**: Stateless, resource-based API
5. **Security by Design**: Authentication and authorization at every layer

## 🏛️ Architecture Patterns

### Backend Patterns

#### 1. **Layered Architecture**
```
┌─────────────────────────────────────┐
│           Routes Layer              │ ← HTTP endpoints
├─────────────────────────────────────┤
│         Middleware Layer            │ ← Auth, validation, logging
├─────────────────────────────────────┤
│        Business Logic Layer         │ ← Core application logic
├─────────────────────────────────────┤
│         Data Access Layer           │ ← Prisma ORM
├─────────────────────────────────────┤
│          Database Layer             │ ← SQLite/PostgreSQL
└─────────────────────────────────────┘
```

#### 2. **Middleware Pattern**
- **Authentication Middleware**: JWT token validation
- **Authorization Middleware**: Role-based access control
- **Error Handling Middleware**: Centralized error processing
- **Logging Middleware**: Request/response logging

#### 3. **Repository Pattern** (via Prisma)
- Abstraction over data access
- Consistent query interface
- Easy testing with mocks

### Frontend Patterns

#### 1. **Component-Based Architecture**
```
App
├── Layout Components
│   ├── Navbar
│   └── Sidebar
├── Page Components
│   ├── Dashboard
│   ├── Patients
│   └── Appointments
└── Shared Components
    ├── Forms
    ├── Tables
    └── Modals
```

#### 2. **Container/Presentational Pattern**
- **Containers**: Handle state and business logic
- **Presentational**: Pure UI components
- Clear separation of concerns

## 🔧 Backend Architecture

### Directory Structure
```
backend/
├── server.js              # Application entry point
├── routes/                # Route handlers
│   ├── authRoutes.js      # Authentication endpoints
│   ├── userRoutes.js      # User management
│   ├── patientRoutes.js   # Patient CRUD
│   └── appointmentRoutes.js # Appointment management
├── middlewares/           # Custom middleware
│   └── authMiddleware.js  # JWT authentication
├── prisma/               # Database layer
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Database migrations
├── tests/                # Test suites
└── swagger.yaml          # API documentation
```

### Request Flow
```
HTTP Request
    ↓
Express Router
    ↓
Authentication Middleware
    ↓
Authorization Middleware
    ↓
Route Handler
    ↓
Business Logic
    ↓
Prisma ORM
    ↓
Database
    ↓
Response
```

### Key Components

#### 1. **Authentication System**
```javascript
// JWT-based authentication
const authMiddleware = (roles = []) => (req, res, next) => {
  // Token validation
  // Role-based authorization
  // User context injection
};
```

#### 2. **Error Handling**
```javascript
// Centralized error handling
app.use((error, req, res, next) => {
  // Log error
  // Format response
  // Send appropriate status code
});
```

#### 3. **Database Layer**
```javascript
// Prisma client singleton
const prisma = new PrismaClient();
// Consistent query interface
// Type-safe database operations
```

## 🎨 Frontend Architecture

### Directory Structure
```
frontend/src/
├── main.jsx              # Application entry point
├── App.jsx               # Root component
├── components/           # Reusable components
│   ├── Navbar.jsx
│   ├── ProtectedRoute.jsx
│   └── common/
├── pages/                # Page components
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── Patients.jsx
│   └── Appointments.jsx
├── styles/               # CSS and styling
├── utils/                # Utility functions
└── assets/               # Static assets
```

### Component Hierarchy
```
App
├── Router
│   ├── Public Routes
│   │   ├── Login
│   │   └── Register
│   └── Protected Routes
│       ├── Layout (with Navbar)
│       ├── Dashboard
│       ├── Patients
│       ├── Appointments
│       └── Profile
```

### State Management
- **Local State**: React hooks (useState, useEffect)
- **Authentication State**: localStorage + context
- **Form State**: Controlled components
- **Server State**: Direct API calls with axios

### Key Components

#### 1. **Protected Routes**
```javascript
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" />;
};
```

#### 2. **Authentication Context**
```javascript
// User authentication state
// Login/logout functions
// Role-based rendering
```

## 🗄️ Database Design

### Entity Relationship Diagram
```
┌─────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    User     │    │    Patient      │    │  Appointment    │
├─────────────┤    ├─────────────────┤    ├─────────────────┤
│ id (PK)     │    │ id (PK)         │    │ id (PK)         │
│ name        │    │ name            │    │ date            │
│ email       │◄──►│ age             │    │ status          │
│ password    │    │ medicalHistory  │    │ doctorId (FK)   │
│ role        │    │ insuranceDetails│    │ patientId (FK)  │
└─────────────┘    │ doctorId (FK)   │    └─────────────────┘
                   └─────────────────┘
```

### Schema Design Principles

1. **Normalization**: Minimize data redundancy
2. **Referential Integrity**: Foreign key constraints
3. **Indexing**: Optimize query performance
4. **Data Types**: Appropriate types for each field
5. **Constraints**: Ensure data validity

### Key Relationships

- **User → Patient**: One doctor can have many patients
- **User → Appointment**: Users can have multiple appointments
- **Patient ← Appointment**: Appointments reference patients

## 🔒 Security Architecture

### Authentication Flow
```
1. User Login → Credentials Validation
2. Password Hashing (bcrypt) → JWT Generation
3. Token Storage (localStorage) → API Requests
4. Token Validation → Route Access
```

### Security Layers

#### 1. **Transport Security**
- HTTPS in production
- CORS configuration
- Secure headers

#### 2. **Authentication Security**
- JWT tokens with expiration
- bcrypt password hashing (salt rounds: 10)
- Secure token storage

#### 3. **Authorization Security**
- Role-based access control (RBAC)
- Route-level permissions
- Resource-level access control

#### 4. **Data Security**
- Input validation and sanitization
- SQL injection prevention (Prisma)
- XSS protection

### Security Middleware Stack
```javascript
app.use(cors());                    // CORS protection
app.use(helmet());                  // Security headers
app.use(rateLimit());              // Rate limiting
app.use(authMiddleware());         // Authentication
app.use(authorizationMiddleware()); // Authorization
```

## 🔌 API Design

### RESTful Principles

#### Resource-Based URLs
```
GET    /api/patients        # Get all patients
POST   /api/patients        # Create patient
GET    /api/patients/:id    # Get specific patient
PUT    /api/patients/:id    # Update patient
DELETE /api/patients/:id    # Delete patient
```

#### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

#### Response Format
```javascript
// Success Response
{
  "message": "Operation successful",
  "data": { /* response data */ }
}

// Error Response
{
  "error": "Error description",
  "details": { /* error details */ }
}
```

### API Versioning
- URL versioning: `/api/v1/patients`
- Header versioning: `Accept: application/vnd.api+json;version=1`

## 🔄 Data Flow

### Authentication Flow
```
Frontend                Backend               Database
   │                      │                     │
   ├─ POST /api/auth/login ─→ Validate credentials ─→ Query user
   │                      │                     │
   │                      ←─ Generate JWT token ←─ Return user data
   │                      │                     │
   ←─ Return token ───────┤                     │
   │                      │                     │
   ├─ Store token         │                     │
```

### CRUD Operations Flow
```
Frontend                Backend               Database
   │                      │                     │
   ├─ API Request + Token ─→ Validate token     │
   │                      │                     │
   │                      ├─ Check permissions  │
   │                      │                     │
   │                      ├─ Business logic ────→ Execute query
   │                      │                     │
   │                      ←─ Format response ───← Return data
   │                      │                     │
   ←─ JSON Response ──────┤                     │
```

## 📈 Scalability Considerations

### Current Architecture Limitations
- Single database instance
- Stateful JWT storage
- No caching layer
- Monolithic backend

### Scaling Strategies

#### 1. **Horizontal Scaling**
- Load balancer for multiple backend instances
- Database read replicas
- CDN for static assets

#### 2. **Caching Strategy**
- Redis for session storage
- Application-level caching
- Database query caching

#### 3. **Microservices Migration**
```
Monolith → Microservices
├── User Service
├── Patient Service
├── Appointment Service
└── Notification Service
```

#### 4. **Database Scaling**
- Connection pooling
- Database sharding
- Read/write separation

### Performance Optimizations

#### Backend
- Database indexing
- Query optimization
- Response compression
- API rate limiting

#### Frontend
- Code splitting
- Lazy loading
- Image optimization
- Bundle optimization

## 🔧 Technology Decisions

### Backend Technology Choices

| Technology | Reason | Alternatives Considered |
|------------|--------|------------------------|
| Node.js | JavaScript ecosystem, async I/O | Python (Django), Java (Spring) |
| Express.js | Lightweight, flexible | Fastify, Koa.js |
| Prisma | Type-safe ORM, migrations | Sequelize, TypeORM |
| SQLite | Development simplicity | PostgreSQL, MySQL |
| JWT | Stateless authentication | Sessions, OAuth |

### Frontend Technology Choices

| Technology | Reason | Alternatives Considered |
|------------|--------|------------------------|
| React 19 | Component-based, ecosystem | Vue.js, Angular |
| Material-UI | Pre-built components | Ant Design, Chakra UI |
| Vite | Fast development server | Create React App, Webpack |
| Axios | HTTP client with interceptors | Fetch API, SWR |

## 📝 Architecture Decision Records (ADRs)

### ADR-001: JWT Authentication
**Decision**: Use JWT tokens for authentication
**Rationale**: Stateless, scalable, works well with SPA
**Consequences**: Token management complexity, no server-side revocation

### ADR-002: Prisma ORM
**Decision**: Use Prisma as the database ORM
**Rationale**: Type safety, excellent developer experience, migration support
**Consequences**: Learning curve, vendor lock-in

### ADR-003: Role-Based Authorization
**Decision**: Implement RBAC with three roles (admin, doctor, patient)
**Rationale**: Clear permission model, easy to understand and implement
**Consequences**: May need more granular permissions in the future

---

This architecture documentation should be updated as the system evolves and new architectural decisions are made.