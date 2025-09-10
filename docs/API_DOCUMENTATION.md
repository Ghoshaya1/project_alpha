# 🔌 API Documentation

Complete documentation for the Patient Management System REST API.

## 📋 Table of Contents

1. [API Overview](#-api-overview)
2. [Authentication](#-authentication)
3. [Authorization](#-authorization)
4. [Error Handling](#-error-handling)
5. [Auth Endpoints](#-auth-endpoints)
6. [User Endpoints](#-user-endpoints)
7. [Patient Endpoints](#-patient-endpoints)
8. [Appointment Endpoints](#-appointment-endpoints)
9. [Response Formats](#-response-formats)
10. [Rate Limiting](#-rate-limiting)
11. [Testing](#-testing)

## 🎯 API Overview

### Base URL
- **Development**: `http://localhost:5000/api`
- **Staging**: `https://staging-api.patient-mgmt.com/api`
- **Production**: `https://api.patient-mgmt.com/api`

### API Version
- **Current Version**: v1
- **Versioning**: URL-based (`/api/v1/...`)

### Content Type
- **Request**: `application/json`
- **Response**: `application/json`

### HTTP Methods
- `GET` - Retrieve resources
- `POST` - Create new resources
- `PUT` - Update existing resources
- `DELETE` - Remove resources

## 🔐 Authentication

### JWT Token Authentication

The API uses JSON Web Tokens (JWT) for authentication. Tokens must be included in the `Authorization` header.

#### Token Format
```
Authorization: Bearer <jwt_token>
```

#### Token Structure
```javascript
{
  "userId": "uuid-string",
  "role": "admin|doctor|patient",
  "iat": 1234567890,    // Issued at
  "exp": 1234567890     // Expires at (24h from issue)
}
```

#### Getting a Token
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor@example.com",
    "password": "password123"
  }'
```

#### Using the Token
```bash
curl -X GET http://localhost:5000/api/users/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## 🛡️ Authorization

### User Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| **admin** | System administrator | Full access to all resources |
| **doctor** | Medical practitioner | Manage patients and appointments |
| **patient** | Healthcare recipient | View own records and appointments |

### Role-Based Access Control

#### Admin Permissions
- ✅ All user management operations
- ✅ All patient operations
- ✅ All appointment operations
- ✅ System configuration

#### Doctor Permissions
- ✅ Create, read, update, delete patients
- ✅ View all appointments
- ✅ Update appointment status
- ✅ View own profile
- ❌ User management operations

#### Patient Permissions
- ✅ View own profile
- ✅ View own appointments
- ✅ Book appointments
- ❌ Access other patients' data
- ❌ Administrative operations

## ❌ Error Handling

### Standard Error Response
```javascript
{
  "error": "Error message",
  "details": "Additional error details (optional)",
  "code": "ERROR_CODE (optional)"
}
```

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| `200` | OK | Request successful |
| `201` | Created | Resource created successfully |
| `400` | Bad Request | Invalid request data |
| `401` | Unauthorized | Authentication required |
| `403` | Forbidden | Insufficient permissions |
| `404` | Not Found | Resource not found |
| `409` | Conflict | Resource already exists |
| `422` | Unprocessable Entity | Validation errors |
| `500` | Internal Server Error | Server error |

### Common Error Examples

#### Authentication Error
```javascript
{
  "error": "Invalid token",
  "code": "AUTH_INVALID_TOKEN"
}
```

#### Authorization Error
```javascript
{
  "error": "Forbidden",
  "details": "Insufficient permissions for this operation"
}
```

#### Validation Error
```javascript
{
  "error": "Validation failed",
  "details": {
    "email": "Invalid email format",
    "password": "Password must be at least 8 characters"
  }
}
```

## 🔑 Auth Endpoints

### POST /api/auth/register

Register a new user account.

#### Request
```javascript
{
  "name": "Dr. John Smith",
  "email": "john.smith@hospital.com",
  "password": "securePassword123",
  "role": "doctor"
}
```

#### Response (201 Created)
```javascript
{
  "message": "User registered",
  "user": {
    "id": "uuid-string",
    "name": "Dr. John Smith",
    "email": "john.smith@hospital.com",
    "role": "doctor"
  }
}
```

#### Validation Rules
- `name`: Required, 2-100 characters
- `email`: Required, valid email format, unique
- `password`: Required, minimum 8 characters
- `role`: Required, one of: "admin", "doctor", "patient"

#### Example cURL
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. John Smith",
    "email": "john.smith@hospital.com",
    "password": "securePassword123",
    "role": "doctor"
  }'
```

### POST /api/auth/login

Authenticate user and receive JWT token.

#### Request
```javascript
{
  "email": "john.smith@hospital.com",
  "password": "securePassword123"
}
```

#### Response (200 OK)
```javascript
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Example cURL
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.smith@hospital.com",
    "password": "securePassword123"
  }'
```

## 👥 User Endpoints

### GET /api/users

Get all users (Admin only).

#### Headers
```
Authorization: Bearer <admin_token>
```

#### Response (200 OK)
```javascript
[
  {
    "id": "uuid-1",
    "name": "Admin User",
    "email": "admin@hospital.com",
    "role": "admin"
  },
  {
    "id": "uuid-2",
    "name": "Dr. Smith",
    "email": "doctor@hospital.com",
    "role": "doctor"
  }
]
```

### GET /api/users/me

Get current user information.

#### Headers
```
Authorization: Bearer <user_token>
```

#### Response (200 OK)
```javascript
{
  "id": "uuid-string",
  "name": "Dr. John Smith",
  "email": "john.smith@hospital.com",
  "role": "doctor"
}
```

### GET /api/users/my-patients

Get patients assigned to current doctor (Doctor only).

#### Headers
```
Authorization: Bearer <doctor_token>
```

#### Response (200 OK)
```javascript
[
  {
    "id": "patient-uuid-1",
    "name": "Jane Doe",
    "age": 35,
    "medicalHistory": "Diabetes, Hypertension",
    "insuranceDetails": "Blue Cross Blue Shield",
    "doctorId": "doctor-uuid"
  }
]
```

### GET /api/users/patient/:id

Get specific patient details (Doctor or Patient themselves).

#### Headers
```
Authorization: Bearer <doctor_or_patient_token>
```

#### Response (200 OK)
```javascript
{
  "id": "patient-uuid",
  "name": "Jane Doe",
  "age": 35,
  "medicalHistory": "Diabetes, Hypertension",
  "insuranceDetails": "Blue Cross Blue Shield",
  "doctorId": "doctor-uuid"
}
```

## 🏥 Patient Endpoints

### POST /api/patients

Create a new patient (Doctor only).

#### Headers
```
Authorization: Bearer <doctor_token>
```

#### Request
```javascript
{
  "name": "Jane Doe",
  "age": 35,
  "medicalHistory": "Diabetes, Hypertension",
  "insuranceDetails": "Blue Cross Blue Shield"
}
```

#### Response (201 Created)
```javascript
{
  "message": "patient created",
  "patient": {
    "id": "patient-uuid",
    "name": "Jane Doe",
    "age": 35,
    "medicalHistory": "Diabetes, Hypertension",
    "insuranceDetails": "Blue Cross Blue Shield",
    "doctorId": "doctor-uuid"
  }
}
```

#### Validation Rules
- `name`: Required, 2-100 characters
- `age`: Required, integer, 0-150
- `medicalHistory`: Optional, string
- `insuranceDetails`: Optional, string

### GET /api/patients/:id

Get patient by ID (Doctor or Patient themselves).

#### Headers
```
Authorization: Bearer <doctor_or_patient_token>
```

#### Response (200 OK)
```javascript
{
  "id": "patient-uuid",
  "name": "Jane Doe",
  "age": 35,
  "medicalHistory": "Diabetes, Hypertension",
  "insuranceDetails": "Blue Cross Blue Shield",
  "doctorId": "doctor-uuid"
}
```

### DELETE /api/patients/:id

Delete patient (Doctor only).

#### Headers
```
Authorization: Bearer <doctor_token>
```

#### Response (200 OK)
```javascript
{
  "message": "Patient deleted",
  "patient": {
    "id": "patient-uuid",
    "name": "Jane Doe",
    // ... other patient data
  }
}
```

## 📅 Appointment Endpoints

### POST /api/appointments

Create a new appointment (Doctor or Patient).

#### Headers
```
Authorization: Bearer <doctor_or_patient_token>
```

#### Request
```javascript
{
  "doctorId": "doctor-uuid",
  "patientId": "patient-uuid",
  "date": "2024-12-01T10:00:00Z"
}
```

#### Response (201 Created)
```javascript
{
  "message": "Appointment booked",
  "appointment": {
    "id": "appointment-uuid",
    "doctorId": "doctor-uuid",
    "patientId": "patient-uuid",
    "date": "2024-12-01T10:00:00.000Z",
    "status": "pending"
  }
}
```

#### Validation Rules
- `doctorId`: Required, valid UUID
- `patientId`: Required, valid UUID
- `date`: Required, valid ISO 8601 date string

### GET /api/appointments

Get all appointments (Admin or Doctor only).

#### Headers
```
Authorization: Bearer <admin_or_doctor_token>
```

#### Response (200 OK)
```javascript
[
  {
    "id": "appointment-uuid",
    "date": "2024-12-01T10:00:00.000Z",
    "status": "pending",
    "doctorId": "doctor-uuid",
    "patientId": "patient-uuid",
    "doctor": {
      "id": "doctor-uuid",
      "name": "Dr. Smith",
      "email": "doctor@hospital.com"
    },
    "patient": {
      "id": "patient-uuid",
      "name": "Jane Doe",
      "email": "jane@email.com"
    }
  }
]
```

### GET /api/appointments/my

Get current patient's appointments (Patient only).

#### Headers
```
Authorization: Bearer <patient_token>
```

#### Response (200 OK)
```javascript
[
  {
    "id": "appointment-uuid",
    "date": "2024-12-01T10:00:00.000Z",
    "status": "confirmed",
    "doctorId": "doctor-uuid",
    "patientId": "patient-uuid",
    "doctor": {
      "id": "doctor-uuid",
      "name": "Dr. Smith",
      "email": "doctor@hospital.com"
    }
  }
]
```

### PUT /api/appointments/:id/status

Update appointment status (Doctor only).

#### Headers
```
Authorization: Bearer <doctor_token>
```

#### Request
```javascript
{
  "status": "confirmed"
}
```

#### Response (200 OK)
```javascript
{
  "message": "Appointment status updated",
  "appointment": {
    "id": "appointment-uuid",
    "date": "2024-12-01T10:00:00.000Z",
    "status": "confirmed",
    "doctorId": "doctor-uuid",
    "patientId": "patient-uuid"
  }
}
```

#### Valid Status Values
- `pending` - Default status
- `confirmed` - Appointment confirmed
- `completed` - Appointment completed
- `cancelled` - Appointment cancelled

## 📊 Response Formats

### Success Response Format
```javascript
{
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

### Error Response Format
```javascript
{
  "error": "Error description",
  "details": "Additional details (optional)",
  "code": "ERROR_CODE (optional)"
}
```

### Pagination (Future Enhancement)
```javascript
{
  "data": [ /* array of items */ ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

## 🚦 Rate Limiting

### Current Limits
- **General API**: 100 requests per 15 minutes per IP
- **Auth endpoints**: 5 requests per 15 minutes per IP
- **File uploads**: 10 requests per hour per user

### Rate Limit Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

### Rate Limit Exceeded Response
```javascript
{
  "error": "Too many requests",
  "details": "Rate limit exceeded. Try again later.",
  "retryAfter": 900
}
```

## 🧪 Testing

### Postman Collection

Import the Postman collection for easy API testing:
```bash
# Collection URL (if available)
https://api.postman.com/collections/your-collection-id
```

### Example Test Workflow

#### 1. Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Doctor",
    "email": "test@doctor.com",
    "password": "password123",
    "role": "doctor"
  }'
```

#### 2. Login and Get Token
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@doctor.com",
    "password": "password123"
  }'
```

#### 3. Create a Patient
```bash
curl -X POST http://localhost:5000/api/patients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Test Patient",
    "age": 30,
    "medicalHistory": "No significant history"
  }'
```

#### 4. Book an Appointment
```bash
curl -X POST http://localhost:5000/api/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "doctorId": "DOCTOR_UUID",
    "patientId": "PATIENT_UUID",
    "date": "2024-12-01T10:00:00Z"
  }'
```

### Testing with Jest

Run the API test suite:
```bash
cd backend
npm test
```

### Manual Testing Checklist

- [ ] User registration works
- [ ] User login returns valid JWT
- [ ] Protected routes require authentication
- [ ] Role-based access control works
- [ ] CRUD operations function correctly
- [ ] Error responses are properly formatted
- [ ] Input validation works
- [ ] Rate limiting is enforced

## 📚 Additional Resources

- **Swagger UI**: http://localhost:5000/api-docs (when server is running)
- **Postman Collection**: [Link to collection]
- **API Testing Guide**: [Link to testing documentation]
- **Authentication Guide**: [Link to auth documentation]

---

**Need help?** Check the troubleshooting section or reach out to the development team.

*Last updated: $(date)*