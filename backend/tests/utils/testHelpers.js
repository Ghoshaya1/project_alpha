const jwt = require('jsonwebtoken');

/**
 * Generate a valid JWT token for testing
 */
const generateToken = (payload = {}) => {
  const defaultPayload = {
    userId: 'test-user-id',
    role: 'doctor',
    ...payload,
  };
  
  return jwt.sign(defaultPayload, process.env.JWT_SECRET, { expiresIn: '1h' });
};

/**
 * Generate tokens for different user roles
 */
const generateTokens = {
  admin: () => generateToken({ userId: 'admin-id', role: 'admin' }),
  doctor: () => generateToken({ userId: 'doctor-id', role: 'doctor' }),
  patient: () => generateToken({ userId: 'patient-id', role: 'patient' }),
};

/**
 * Mock user data for testing
 */
const mockUsers = {
  admin: {
    id: 'admin-id',
    name: 'Admin User',
    email: 'admin@test.com',
    role: 'admin',
    password: 'hashedpassword',
  },
  doctor: {
    id: 'doctor-id',
    name: 'Dr. Smith',
    email: 'doctor@test.com',
    role: 'doctor',
    password: 'hashedpassword',
  },
  patient: {
    id: 'patient-id',
    name: 'John Doe',
    email: 'patient@test.com',
    role: 'patient',
    password: 'hashedpassword',
  },
};

/**
 * Mock patient data for testing
 */
const mockPatients = {
  patient1: {
    id: 'patient-1',
    name: 'John Doe',
    age: 30,
    medicalHistory: 'No significant history',
    insuranceDetails: 'Health Plus',
    doctorId: 'doctor-id',
  },
  patient2: {
    id: 'patient-2',
    name: 'Jane Smith',
    age: 25,
    medicalHistory: 'Allergic to penicillin',
    insuranceDetails: 'MediCare',
    doctorId: 'doctor-id',
  },
};

/**
 * Mock appointment data for testing
 */
const mockAppointments = {
  appointment1: {
    id: 'appointment-1',
    date: new Date('2024-12-01T10:00:00Z'),
    status: 'pending',
    doctorId: 'doctor-id',
    patientId: 'patient-id',
    doctor: mockUsers.doctor,
    patient: mockUsers.patient,
  },
  appointment2: {
    id: 'appointment-2',
    date: new Date('2024-12-02T14:00:00Z'),
    status: 'confirmed',
    doctorId: 'doctor-id',
    patientId: 'patient-id',
    doctor: mockUsers.doctor,
    patient: mockUsers.patient,
  },
};

/**
 * Create a mock Express request object
 */
const mockRequest = (overrides = {}) => ({
  body: {},
  params: {},
  query: {},
  headers: {},
  user: null,
  ...overrides,
});

/**
 * Create a mock Express response object
 */
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

/**
 * Create a mock Express next function
 */
const mockNext = () => jest.fn();

module.exports = {
  generateToken,
  generateTokens,
  mockUsers,
  mockPatients,
  mockAppointments,
  mockRequest,
  mockResponse,
  mockNext,
};